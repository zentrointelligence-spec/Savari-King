const db = require("../db");

/**
 * Special Offers Service
 * Handles automatic detection and application of special offers to bookings
 */

/**
 * Get all currently active special offers
 * @returns {Array} List of active offers
 */
exports.getActiveOffers = async () => {
  try {
    const query = `
      SELECT
        id,
        title,
        slug,
        description,
        short_description,
        offer_type,
        discount_percentage,
        discount_amount,
        min_booking_amount,
        max_discount_amount,
        valid_from,
        valid_until,
        usage_limit,
        usage_count,
        usage_limit_per_user,
        promo_code,
        is_featured,
        terms_conditions,
        display_order
      FROM special_offers
      WHERE is_active = true
        AND NOW() BETWEEN valid_from AND valid_until
        AND (usage_limit IS NULL OR usage_count < usage_limit)
      ORDER BY
        is_featured DESC,
        display_order ASC,
        discount_percentage DESC NULLS LAST,
        discount_amount DESC NULLS LAST
    `;

    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching active offers:", error);
    return [];
  }
};

/**
 * Check if a user has already used a specific offer
 * @param {number} userId - User ID
 * @param {number} offerId - Offer ID
 * @returns {Object} Usage info
 */
exports.getUserOfferUsage = async (userId, offerId) => {
  try {
    const query = `
      SELECT COUNT(*) as usage_count
      FROM bookings b
      WHERE b.user_id = $1
        AND b.applied_offers @> $2::jsonb
        AND b.status IN ('Payment Confirmed', 'Trip Completed')
    `;

    const result = await db.query(query, [
      userId,
      JSON.stringify([{ offer_id: offerId }])
    ]);

    return {
      usageCount: parseInt(result.rows[0]?.usage_count || 0)
    };
  } catch (error) {
    console.error("Error checking user offer usage:", error);
    return { usageCount: 0 };
  }
};

/**
 * Find all applicable offers for a booking
 * @param {Object} bookingData - Booking details
 * @returns {Array} List of applicable offers with calculated discounts
 */
exports.findApplicableOffers = async (bookingData) => {
  const {
    userId,
    totalAmount,
    travelDate,
    tourId,
    numberOfPersons,
    bookingDate
  } = bookingData;

  try {
    const activeOffers = await exports.getActiveOffers();
    const applicableOffers = [];

    for (const offer of activeOffers) {
      // Check minimum booking amount
      if (offer.min_booking_amount && totalAmount < parseFloat(offer.min_booking_amount)) {
        continue;
      }

      // Check user usage limit
      if (offer.usage_limit_per_user) {
        const userUsage = await exports.getUserOfferUsage(userId, offer.id);
        if (userUsage.usageCount >= offer.usage_limit_per_user) {
          continue;
        }
      }

      // Calculate discount based on offer type
      let discountAmount = 0;
      let discountPercentage = 0;
      let applicableReason = "";

      switch (offer.offer_type) {
        case "percentage":
          discountPercentage = parseFloat(offer.discount_percentage);
          discountAmount = (totalAmount * discountPercentage) / 100;

          // Apply max discount limit if specified
          if (offer.max_discount_amount && discountAmount > parseFloat(offer.max_discount_amount)) {
            discountAmount = parseFloat(offer.max_discount_amount);
          }

          applicableReason = `${discountPercentage}% discount`;
          break;

        case "fixed_amount":
          discountAmount = parseFloat(offer.discount_amount);
          discountPercentage = (discountAmount / totalAmount) * 100;
          applicableReason = `Fixed discount of ₹${discountAmount}`;
          break;

        case "early_bird":
          // Early bird: booking made X days before travel
          const daysBeforeTravel = Math.floor(
            (new Date(travelDate) - new Date(bookingDate)) / (1000 * 60 * 60 * 24)
          );

          // Apply if booking is at least 30 days in advance
          if (daysBeforeTravel >= 30) {
            discountPercentage = parseFloat(offer.discount_percentage || 15);
            discountAmount = (totalAmount * discountPercentage) / 100;
            applicableReason = `Early bird - booked ${daysBeforeTravel} days in advance`;
          }
          break;

        case "last_minute":
          // Last minute: booking made within X days of travel
          const daysUntilTravel = Math.floor(
            (new Date(travelDate) - new Date()) / (1000 * 60 * 60 * 24)
          );

          // Apply if booking is within 7 days of travel
          if (daysUntilTravel <= 7 && daysUntilTravel >= 5) {
            discountPercentage = parseFloat(offer.discount_percentage || 10);
            discountAmount = (totalAmount * discountPercentage) / 100;
            applicableReason = `Last minute - ${daysUntilTravel} days until travel`;
          }
          break;

        case "seasonal":
          // Seasonal offers apply based on travel date
          const travelMonth = new Date(travelDate).getMonth() + 1;

          // Example: Monsoon season (June-September)
          if (travelMonth >= 6 && travelMonth <= 9) {
            discountPercentage = parseFloat(offer.discount_percentage || 20);
            discountAmount = (totalAmount * discountPercentage) / 100;
            applicableReason = "Seasonal offer - Monsoon season";
          }
          break;

        case "buy_one_get_one":
          // BOGO logic - not applicable for tour bookings
          continue;

        default:
          continue;
      }

      // Only add if discount is positive
      if (discountAmount > 0) {
        applicableOffers.push({
          offerId: offer.id,
          offerTitle: offer.title,
          offerType: offer.offer_type,
          discountAmount: Math.round(discountAmount * 100) / 100,
          discountPercentage: Math.round(discountPercentage * 100) / 100,
          applicableReason,
          isFeatured: offer.is_featured,
          termsConditions: offer.terms_conditions,
          priority: offer.display_order,
          maxDiscountAmount: offer.max_discount_amount
        });
      }
    }

    // Sort by discount amount (highest first)
    applicableOffers.sort((a, b) => b.discountAmount - a.discountAmount);

    return applicableOffers;
  } catch (error) {
    console.error("Error finding applicable offers:", error);
    return [];
  }
};

/**
 * Calculate best offer strategy (cumulative or best single)
 * @param {Array} applicableOffers - List of applicable offers
 * @param {number} totalAmount - Total booking amount
 * @param {string} strategy - 'best_single' or 'cumulative'
 * @returns {Object} Selected offers and total discount
 */
exports.calculateBestOfferStrategy = (applicableOffers, totalAmount, strategy = 'best_single') => {
  if (!applicableOffers || applicableOffers.length === 0) {
    return {
      selectedOffers: [],
      totalDiscount: 0,
      finalAmount: totalAmount
    };
  }

  let selectedOffers = [];
  let totalDiscount = 0;

  if (strategy === 'best_single') {
    // Select the offer with the highest discount
    const bestOffer = applicableOffers[0]; // Already sorted by discount amount
    selectedOffers = [bestOffer];
    totalDiscount = bestOffer.discountAmount;
  } else if (strategy === 'cumulative') {
    // Apply multiple offers (up to 3, max 40% total discount)
    let cumulativeDiscountPercentage = 0;
    const maxCumulativePercentage = 40;
    const maxOffers = 3;

    for (let i = 0; i < Math.min(applicableOffers.length, maxOffers); i++) {
      const offer = applicableOffers[i];

      if (cumulativeDiscountPercentage + offer.discountPercentage <= maxCumulativePercentage) {
        selectedOffers.push(offer);
        totalDiscount += offer.discountAmount;
        cumulativeDiscountPercentage += offer.discountPercentage;
      }
    }
  }

  const finalAmount = Math.max(totalAmount - totalDiscount, 0);

  return {
    selectedOffers,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
    discountPercentage: Math.round((totalDiscount / totalAmount) * 100 * 100) / 100
  };
};

/**
 * Apply offers to a booking revision
 * @param {number} bookingId - Booking ID
 * @param {number} revisionId - Revision ID
 * @param {Array} selectedOffers - Selected offers to apply
 * @returns {Object} Update result
 */
exports.applyOffersToRevision = async (bookingId, revisionId, selectedOffers) => {
  try {
    // Format offers for storage
    const offersData = selectedOffers.map(offer => ({
      offer_id: offer.offerId,
      offer_title: offer.offerTitle,
      offer_type: offer.offerType,
      discount_amount: offer.discountAmount,
      discount_percentage: offer.discountPercentage,
      reason: offer.applicableReason
    }));

    // Update revision with applied offers
    const query = `
      UPDATE booking_quote_revisions
      SET applied_offers = $1::jsonb
      WHERE id = $2 AND booking_id = $3
      RETURNING id, applied_offers
    `;

    const result = await db.query(query, [
      JSON.stringify(offersData),
      revisionId,
      bookingId
    ]);

    // Increment usage count for each offer
    for (const offer of selectedOffers) {
      await db.query(
        'UPDATE special_offers SET usage_count = usage_count + 1 WHERE id = $1',
        [offer.offerId]
      );
    }

    return {
      success: true,
      appliedOffers: result.rows[0]?.applied_offers || []
    };
  } catch (error) {
    console.error("Error applying offers to revision:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get offer recommendations for admin
 * @param {Object} bookingData - Booking details
 * @returns {Object} Recommendations with multiple strategies
 */
exports.getOfferRecommendations = async (bookingData) => {
  try {
    const applicableOffers = await exports.findApplicableOffers(bookingData);

    if (applicableOffers.length === 0) {
      return {
        hasOffers: false,
        message: "No special offers applicable for this booking",
        applicableOffers: []
      };
    }

    const bestSingleStrategy = exports.calculateBestOfferStrategy(
      applicableOffers,
      bookingData.totalAmount,
      'best_single'
    );

    const cumulativeStrategy = exports.calculateBestOfferStrategy(
      applicableOffers,
      bookingData.totalAmount,
      'cumulative'
    );

    // Recommend the strategy with highest discount
    const recommendedStrategy = bestSingleStrategy.totalDiscount > cumulativeStrategy.totalDiscount
      ? 'best_single'
      : 'cumulative';

    return {
      hasOffers: true,
      applicableOffers,
      strategies: {
        bestSingle: bestSingleStrategy,
        cumulative: cumulativeStrategy
      },
      recommended: recommendedStrategy,
      recommendedOffers: recommendedStrategy === 'best_single'
        ? bestSingleStrategy
        : cumulativeStrategy
    };
  } catch (error) {
    console.error("Error generating offer recommendations:", error);
    return {
      hasOffers: false,
      error: error.message,
      applicableOffers: []
    };
  }
};

module.exports = exports;
