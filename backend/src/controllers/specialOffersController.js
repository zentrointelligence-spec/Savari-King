const specialOffersService = require('../services/specialOffersService');
const db = require('../db');

/**
 * Get applicable special offers for a booking during quote review
 * @route GET /api/bookings/:bookingId/review/:revisionId/applicable-offers
 * @access Private (Admin only)
 */
exports.getApplicableOffersForReview = async (req, res) => {
  const { bookingId, revisionId } = req.params;

  try {
    // Get booking details
    const bookingResult = await db.query(
      `SELECT
        b.id,
        b.user_id,
        b.travel_date,
        b.tour_id,
        b.num_adults + COALESCE(b.num_children, 0) as number_of_persons,
        b.created_at as booking_date,
        bqr.final_price as total_amount,
        bqr.currency
      FROM bookings b
      JOIN booking_quote_revisions bqr ON b.id = bqr.booking_id
      WHERE b.id = $1 AND bqr.id = $2`,
      [bookingId, revisionId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking or revision not found'
      });
    }

    const booking = bookingResult.rows[0];

    // Prepare booking data for offers service
    const bookingData = {
      userId: booking.user_id,
      totalAmount: parseFloat(booking.total_amount),
      travelDate: booking.travel_date,
      tourId: booking.tour_id,
      numberOfPersons: booking.number_of_persons,
      bookingDate: booking.booking_date,
      currency: booking.currency
    };

    // Get offer recommendations
    const recommendations = await specialOffersService.getOfferRecommendations(bookingData);

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error fetching applicable offers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

/**
 * Apply selected offers to a revision
 * @route POST /api/bookings/:bookingId/review/:revisionId/apply-offers
 * @access Private (Admin only)
 */
exports.applyOffersToRevision = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const { selectedOffers, strategy } = req.body;

  try {
    // Verify revision
    const revisionCheck = await db.query(
      'SELECT * FROM booking_quote_revisions WHERE id = $1 AND booking_id = $2',
      [revisionId, bookingId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Revision not found'
      });
    }

    const revision = revisionCheck.rows[0];
    const currentSubtotal = parseFloat(revision.subtotal_price);

    // Calculate discounts from offers
    const offerDiscounts = selectedOffers.map(offer => ({
      type: 'special_offer',
      name: offer.offerTitle,
      offer_id: offer.offerId,
      amount: offer.discountAmount,
      percentage: offer.discountPercentage,
      reason: offer.applicableReason
    }));

    // Get existing discounts (non-offer discounts)
    const existingDiscounts = revision.discounts ?
      (typeof revision.discounts === 'string' ? JSON.parse(revision.discounts) : revision.discounts) : [];

    const nonOfferDiscounts = existingDiscounts.filter(d => d.type !== 'special_offer');

    // Combine all discounts
    const allDiscounts = [...nonOfferDiscounts, ...offerDiscounts];

    // Calculate total discount amount
    const totalDiscounts = allDiscounts.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    // Calculate new final price
    const totalFees = parseFloat(revision.total_fees || 0);
    const newFinalPrice = currentSubtotal - totalDiscounts + totalFees;

    // Update revision with applied offers
    const updateResult = await db.query(
      `UPDATE booking_quote_revisions
       SET applied_offers = $1,
           discounts = $2,
           total_discounts = $3,
           final_price = $4
       WHERE id = $5
       RETURNING *`,
      [
        JSON.stringify(selectedOffers.map(o => ({
          offer_id: o.offerId,
          offer_title: o.offerTitle,
          offer_type: o.offerType,
          discount_amount: o.discountAmount,
          discount_percentage: o.discountPercentage,
          reason: o.applicableReason
        }))),
        JSON.stringify(allDiscounts),
        totalDiscounts,
        newFinalPrice,
        revisionId
      ]
    );

    // Increment usage count for each offer
    for (const offer of selectedOffers) {
      await db.query(
        'UPDATE special_offers SET usage_count = usage_count + 1 WHERE id = $1',
        [offer.offerId]
      );
    }

    res.status(200).json({
      success: true,
      message: `${selectedOffers.length} special offer(s) applied successfully`,
      data: {
        appliedOffers: selectedOffers,
        totalDiscount: totalDiscounts,
        newFinalPrice,
        revision: updateResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Error applying offers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

/**
 * Auto-apply best offers to a revision
 * @route POST /api/bookings/:bookingId/review/:revisionId/auto-apply-offers
 * @access Private (Admin only)
 */
exports.autoApplyBestOffers = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const { strategy = 'best_single' } = req.body;

  try {
    // Get applicable offers
    const bookingResult = await db.query(
      `SELECT
        b.id,
        b.user_id,
        b.travel_date,
        b.tour_id,
        b.num_adults + COALESCE(b.num_children, 0) as number_of_persons,
        b.created_at as booking_date,
        bqr.subtotal_price as total_amount,
        bqr.currency
      FROM bookings b
      JOIN booking_quote_revisions bqr ON b.id = bqr.booking_id
      WHERE b.id = $1 AND bqr.id = $2`,
      [bookingId, revisionId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking or revision not found'
      });
    }

    const booking = bookingResult.rows[0];

    const bookingData = {
      userId: booking.user_id,
      totalAmount: parseFloat(booking.total_amount),
      travelDate: booking.travel_date,
      tourId: booking.tour_id,
      numberOfPersons: booking.number_of_persons,
      bookingDate: booking.booking_date
    };

    // Get recommendations
    const recommendations = await specialOffersService.getOfferRecommendations(bookingData);

    if (!recommendations.hasOffers) {
      return res.status(200).json({
        success: true,
        message: 'No applicable offers found',
        data: {
          appliedOffers: [],
          totalDiscount: 0
        }
      });
    }

    // Get the recommended offers
    const selectedStrategy = recommendations.strategies[strategy === 'cumulative' ? 'cumulative' : 'bestSingle'];
    const selectedOffers = selectedStrategy.selectedOffers;

    if (selectedOffers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No offers to apply',
        data: {
          appliedOffers: [],
          totalDiscount: 0
        }
      });
    }

    // Apply the offers
    const result = await exports.applyOffersToRevision(
      { params: { bookingId, revisionId }, body: { selectedOffers, strategy } },
      res
    );

    // Return is handled by applyOffersToRevision
  } catch (error) {
    console.error('Error auto-applying offers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

/**
 * Remove applied offers from a revision
 * @route DELETE /api/bookings/:bookingId/review/:revisionId/applied-offers
 * @access Private (Admin only)
 */
exports.removeAppliedOffers = async (req, res) => {
  const { bookingId, revisionId } = req.params;

  try {
    // Get revision
    const revisionResult = await db.query(
      'SELECT * FROM booking_quote_revisions WHERE id = $1 AND booking_id = $2',
      [revisionId, bookingId]
    );

    if (revisionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Revision not found'
      });
    }

    const revision = revisionResult.rows[0];
    const appliedOffers = revision.applied_offers || [];

    // Decrement usage count for removed offers
    if (Array.isArray(appliedOffers) && appliedOffers.length > 0) {
      for (const offer of appliedOffers) {
        await db.query(
          'UPDATE special_offers SET usage_count = GREATEST(0, usage_count - 1) WHERE id = $1',
          [offer.offer_id]
        );
      }
    }

    // Remove offer discounts from discounts array
    const existingDiscounts = revision.discounts ?
      (typeof revision.discounts === 'string' ? JSON.parse(revision.discounts) : revision.discounts) : [];

    const nonOfferDiscounts = existingDiscounts.filter(d => d.type !== 'special_offer');
    const newTotalDiscounts = nonOfferDiscounts.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    // Recalculate final price
    const subtotal = parseFloat(revision.subtotal_price);
    const totalFees = parseFloat(revision.total_fees || 0);
    const newFinalPrice = subtotal - newTotalDiscounts + totalFees;

    // Update revision
    await db.query(
      `UPDATE booking_quote_revisions
       SET applied_offers = '[]'::jsonb,
           discounts = $1,
           total_discounts = $2,
           final_price = $3
       WHERE id = $4`,
      [
        JSON.stringify(nonOfferDiscounts),
        newTotalDiscounts,
        newFinalPrice,
        revisionId
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Applied offers removed successfully',
      data: {
        removedOffersCount: appliedOffers.length,
        newFinalPrice
      }
    });
  } catch (error) {
    console.error('Error removing offers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

module.exports = exports;
