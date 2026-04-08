const db = require("../db");

/**
 * Quote View Controller
 * Handles web-based quote viewing and acceptance
 */

/**
 * Helper: Check if quote is expired (> 48 hours)
 */
const isQuoteExpired = (quoteSentDate) => {
  if (!quoteSentDate) return true;
  const now = new Date();
  const sentDate = new Date(quoteSentDate);
  const hoursDiff = (now - sentDate) / (1000 * 60 * 60);
  return hoursDiff > 48;
};

/**
 * Helper: Get time remaining until expiration
 */
const getTimeRemaining = (quoteSentDate) => {
  if (!quoteSentDate) return null;
  const now = new Date();
  const sentDate = new Date(quoteSentDate);
  const expirationDate = new Date(sentDate.getTime() + 48 * 60 * 60 * 1000);
  const diff = expirationDate - now;

  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    totalMilliseconds: diff,
    expirationDate: expirationDate.toISOString()
  };
};

/**
 * Helper: Enrich vehicles with database details
 */
const enrichVehicles = async (vehicles, durationDays) => {
  if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
    return [];
  }

  return await Promise.all(
    vehicles.map(async (v) => {
      if (v.vehicle_id || v.id) {
        const vehicleId = v.vehicle_id || v.id;
        try {
          const vehicleResult = await db.query(
            'SELECT id, name, capacity, base_price_inr FROM vehicles WHERE id = $1',
            [vehicleId]
          );

          if (vehicleResult.rows.length > 0) {
            const vehicleData = vehicleResult.rows[0];
            const quantity = v.adjusted_quantity || v.quantity || 1;
            const pricePerDay = parseFloat(v.adjusted_price || vehicleData.base_price_inr);

            return {
              vehicle_id: vehicleId,
              name: v.name || v.vehicle_name || vehicleData.name,
              quantity,
              capacity: vehicleData.capacity,
              pricePerDay,
              duration: durationDays,
              total: pricePerDay * durationDays * quantity
            };
          }
        } catch (error) {
          console.error(`Error enriching vehicle ${vehicleId}:`, error);
        }
      }
      return v;
    })
  );
};

/**
 * Helper: Enrich addons with database details
 */
const enrichAddons = async (addons, numAdults, numChildren) => {
  if (!addons || !Array.isArray(addons) || addons.length === 0) {
    return [];
  }

  const totalParticipants = numAdults + numChildren;

  return await Promise.all(
    addons.map(async (a) => {
      if (a.addon_id || a.id) {
        const addonId = a.addon_id || a.id;
        try {
          const addonResult = await db.query(
            'SELECT id, name, price, price_per_person FROM addons WHERE id = $1',
            [addonId]
          );

          if (addonResult.rows.length > 0) {
            const addonData = addonResult.rows[0];
            const isPerPerson = addonData.price_per_person !== false;
            const quantity = a.adjusted_quantity || a.quantity || 1;
            const unitPrice = parseFloat(a.adjusted_price || addonData.price);
            const total = isPerPerson ? (unitPrice * totalParticipants) : (unitPrice * quantity);

            return {
              addon_id: addonId,
              name: a.name || a.addon_name || addonData.name,
              quantity,
              unitPrice,
              pricePerPerson: isPerPerson,
              totalParticipants: isPerPerson ? totalParticipants : null,
              total
            };
          }
        } catch (error) {
          console.error(`Error enriching addon ${addonId}:`, error);
        }
      }
      return a;
    })
  );
};

/**
 * Get detailed quote for web view
 */
exports.getDetailedQuote = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const { version } = req.query;

  try {
    // Get booking details
    const bookingQuery = `
      SELECT b.*, t.name as tour_name, t.duration_days, t.destinations,
             pt.tier_name, pt.inclusions_summary
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN packagetiers pt ON b.tier_id = pt.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or access denied'
      });
    }

    const booking = bookingResult.rows[0];

    // Get quote revision
    let revisionQuery;
    let params;

    if (version) {
      // Get specific version
      revisionQuery = `
        SELECT * FROM booking_quote_revisions
        WHERE booking_id = $1 AND revision_number = $2
      `;
      params = [bookingId, version];
    } else {
      // Get accepted version if exists, otherwise latest
      revisionQuery = `
        SELECT * FROM booking_quote_revisions
        WHERE booking_id = $1
        ORDER BY
          CASE WHEN accepted_at IS NOT NULL THEN 0 ELSE 1 END,
          revision_number DESC
        LIMIT 1
      `;
      params = [bookingId];
    }

    const revisionResult = await db.query(revisionQuery, params);

    if (revisionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No quote found for this booking'
      });
    }

    const revision = revisionResult.rows[0];

    // Check if expired
    const expired = isQuoteExpired(booking.quote_sent_date);
    const timeRemaining = getTimeRemaining(booking.quote_sent_date);

    // If expired and not accepted, show expired message
    if (expired && !revision.accepted_at) {
      return res.status(410).json({
        success: false,
        error: 'This quote has expired',
        expired: true
      });
    }

    // Enrich vehicles and addons
    const enrichedVehicles = await enrichVehicles(
      revision.vehicles_adjusted || revision.vehicles_original || [],
      booking.duration_days
    );

    const enrichedAddons = await enrichAddons(
      revision.addons_adjusted || revision.addons_original || [],
      booking.num_adults,
      booking.num_children
    );

    // Prepare response in the format expected by frontend
    const quoteData = {
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        tour_name: booking.tour_name,
        tier_name: booking.tier_name,
        travel_date: booking.travel_date,
        num_adults: booking.num_adults || 0,
        num_children: booking.num_children || 0,
        contact_name: booking.contact_name,
        contact_email: booking.contact_email,
        contact_phone: booking.contact_phone,
        contact_country: booking.contact_country
      },

      tour: {
        duration_days: booking.duration_days,
        destinations: booking.destinations,
        inclusions_summary: booking.inclusions_summary
      },

      revision: {
        revision_number: revision.revision_number,
        accepted_at: revision.accepted_at
      },

      vehicles: enrichedVehicles,
      addons: enrichedAddons.map(a => ({
        ...a,
        description: a.description || null,
        subtotal: a.total,
        unitPrice: a.unitPrice,
        pricePerPerson: a.pricePerPerson,
        name: a.name
      })),

      pricing: {
        tierPrice: parseFloat(revision.base_price || 0),
        vehiclesTotal: parseFloat(revision.vehicles_price || 0),
        addonsTotal: parseFloat(revision.addons_price || 0),
        subtotal: parseFloat(revision.subtotal_price || 0),
        discounts: parseFloat(revision.total_discounts || 0),
        fees: parseFloat(revision.total_fees || 0),
        finalPrice: parseFloat(revision.final_price || 0)
      },

      timeRemaining,
      expired
    };

    res.json({
      success: true,
      data: quoteData
    });
  } catch (error) {
    console.error('Error fetching detailed quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote details'
    });
  }
};

/**
 * Get general quote for web view (simplified version)
 */
exports.getGeneralQuote = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const { version } = req.query;

  try {
    // Get booking details
    const bookingQuery = `
      SELECT b.*, t.name as tour_name, t.duration_days, t.destinations,
             pt.tier_name
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN packagetiers pt ON b.tier_id = pt.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or access denied'
      });
    }

    const booking = bookingResult.rows[0];

    // Get quote revision (same logic as detailed)
    let revisionQuery;
    let params;

    if (version) {
      revisionQuery = `
        SELECT * FROM booking_quote_revisions
        WHERE booking_id = $1 AND revision_number = $2
      `;
      params = [bookingId, version];
    } else {
      revisionQuery = `
        SELECT * FROM booking_quote_revisions
        WHERE booking_id = $1
        ORDER BY
          CASE WHEN accepted_at IS NOT NULL THEN 0 ELSE 1 END,
          revision_number DESC
        LIMIT 1
      `;
      params = [bookingId];
    }

    const revisionResult = await db.query(revisionQuery, params);

    if (revisionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No quote found for this booking'
      });
    }

    const revision = revisionResult.rows[0];

    // Check if expired
    const expired = isQuoteExpired(booking.quote_sent_date);
    const timeRemaining = getTimeRemaining(booking.quote_sent_date);

    // If expired and not accepted, show expired message
    if (expired && !revision.accepted_at) {
      return res.status(410).json({
        success: false,
        error: 'This quote has expired',
        expired: true
      });
    }

    // Prepare response in the format expected by frontend
    const quoteData = {
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        tour_name: booking.tour_name,
        tier_name: booking.tier_name,
        travel_date: booking.travel_date,
        num_adults: booking.num_adults || 0,
        num_children: booking.num_children || 0,
        contact_name: booking.contact_name,
        contact_email: booking.contact_email
      },

      tour: {
        duration_days: booking.duration_days,
        destinations: booking.destinations
      },

      revision: {
        revision_number: revision.revision_number,
        accepted_at: revision.accepted_at
      },

      pricing: {
        tierPrice: parseFloat(revision.base_price || 0),
        vehiclesTotal: parseFloat(revision.vehicles_price || 0),
        addonsTotal: parseFloat(revision.addons_price || 0),
        subtotal: parseFloat(revision.subtotal_price || 0),
        discounts: parseFloat(revision.total_discounts || 0),
        fees: parseFloat(revision.total_fees || 0),
        finalPrice: parseFloat(revision.final_price || 0)
      },

      timeRemaining,
      expired
    };

    res.json({
      success: true,
      data: quoteData
    });
  } catch (error) {
    console.error('Error fetching general quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote details'
    });
  }
};

/**
 * Get all quote versions
 */
exports.getQuoteVersions = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  try {
    // Verify ownership
    const ownerCheck = await db.query(
      'SELECT id FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get all versions
    const versionsQuery = `
      SELECT
        id,
        revision_number,
        final_price,
        accepted_at,
        review_status,
        created_at
      FROM booking_quote_revisions
      WHERE booking_id = $1
      ORDER BY revision_number DESC
    `;

    const result = await db.query(versionsQuery, [bookingId]);

    const versions = result.rows.map(v => ({
      revisionNumber: v.revision_number,
      finalPrice: parseFloat(v.final_price || 0),
      accepted: !!v.accepted_at,
      acceptedAt: v.accepted_at,
      createdAt: v.created_at,
      status: v.review_status
    }));

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('Error fetching quote versions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote versions'
    });
  }
};

/**
 * Accept a quote
 */
exports.acceptQuote = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const { revisionNumber } = req.body;

  try {
    // Get booking and verify ownership
    const bookingQuery = `
      SELECT b.*, t.name as tour_name, pt.tier_name
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN packagetiers pt ON b.tier_id = pt.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

    if (bookingResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const booking = bookingResult.rows[0];

    // Check if quote is expired
    if (isQuoteExpired(booking.quote_sent_date)) {
      return res.status(410).json({
        success: false,
        error: 'This quote has expired and cannot be accepted'
      });
    }

    // Get the revision to accept
    const revisionQuery = revisionNumber
      ? 'SELECT * FROM booking_quote_revisions WHERE booking_id = $1 AND revision_number = $2'
      : 'SELECT * FROM booking_quote_revisions WHERE booking_id = $1 ORDER BY revision_number DESC LIMIT 1';

    const params = revisionNumber ? [bookingId, revisionNumber] : [bookingId];
    const revisionResult = await db.query(revisionQuery, params);

    if (revisionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quote revision not found'
      });
    }

    const revision = revisionResult.rows[0];

    // Check if already accepted
    if (revision.accepted_at) {
      return res.status(400).json({
        success: false,
        error: 'This quote has already been accepted'
      });
    }

    // Accept the quote
    await db.query(
      `UPDATE booking_quote_revisions
       SET accepted_at = NOW(), accepted_by_user_id = $1
       WHERE id = $2`,
      [userId, revision.id]
    );

    // Import email service
    const emailService = require('../services/quoteEmailService');

    // Send emails
    try {
      await emailService.sendQuoteAcceptanceEmailToClient({
        ...booking,
        revision_number: revision.revision_number,
        final_price: revision.final_price
      });

      await emailService.sendQuoteAcceptanceEmailToAdmin({
        ...booking,
        revision_number: revision.revision_number,
        final_price: revision.final_price
      });
    } catch (emailError) {
      console.error('Error sending acceptance emails:', emailError);
      // Don't fail the acceptance if emails fail
    }

    res.json({
      success: true,
      message: 'Quote accepted successfully',
      data: {
        revisionNumber: revision.revision_number,
        acceptedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error accepting quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept quote'
    });
  }
};

module.exports = exports;
