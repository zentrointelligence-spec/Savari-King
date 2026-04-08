const db = require('../db');

/**
 * Contrôleur pour gérer les avis complets d'une réservation
 * Permet de laisser des avis sur le tour, les addons et la destination
 */

/**
 * @description Récupérer les détails d'une réservation pour le formulaire d'avis
 * @route GET /api/booking-reviews/:bookingId/details
 * @access Private
 */
exports.getBookingReviewDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Vérifier que la réservation appartient à l'utilisateur et est complétée
    const bookingQuery = `
      SELECT
        b.id,
        b.booking_reference,
        b.tour_id,
        b.status,
        b.travel_date,
        b.selected_addons,
        b.selected_vehicles,
        t.name as tour_name,
        t.main_image_url as tour_image,
        td.destination_id
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      LEFT JOIN tour_destinations td ON t.id = td.tour_id
      WHERE b.id = $1 AND b.user_id = $2 AND b.status = 'Trip Completed'
      LIMIT 1
    `;

    const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or not completed'
      });
    }

    const booking = bookingResult.rows[0];

    // Récupérer les addons sélectionnés avec leurs détails
    let addonsDetails = [];
    if (booking.selected_addons && Array.isArray(booking.selected_addons) && booking.selected_addons.length > 0) {
      const addonIds = booking.selected_addons
        .filter(a => a.addon_id)
        .map(a => a.addon_id);

      if (addonIds.length > 0) {
        const addonsQuery = `
          SELECT id, name, category
          FROM addons
          WHERE id = ANY($1)
        `;
        const addonsResult = await db.query(addonsQuery, [addonIds]);
        addonsDetails = addonsResult.rows;
      }
    }

    // Récupérer les véhicules sélectionnés avec leurs détails
    let vehiclesDetails = [];
    if (booking.selected_vehicles && Array.isArray(booking.selected_vehicles) && booking.selected_vehicles.length > 0) {
      const vehicleIds = booking.selected_vehicles
        .filter(v => v.vehicle_id || v.id)
        .map(v => v.vehicle_id || v.id);

      if (vehicleIds.length > 0) {
        const vehiclesQuery = `
          SELECT id, name, type, comfort_level, image_url
          FROM vehicles
          WHERE id = ANY($1)
        `;
        const vehiclesResult = await db.query(vehiclesQuery, [vehicleIds]);
        vehiclesDetails = vehiclesResult.rows;
      }
    }

    // Récupérer la destination
    let destinationDetails = null;
    if (booking.destination_id) {
      const destQuery = `
        SELECT id, name, country, thumbnail_image
        FROM destinations
        WHERE id = $1
      `;
      const destResult = await db.query(destQuery, [booking.destination_id]);
      if (destResult.rows.length > 0) {
        destinationDetails = destResult.rows[0];
      }
    }

    // Vérifier si l'utilisateur a déjà laissé des avis
    const existingReviewsQuery = `
      SELECT
        (SELECT COUNT(*) FROM reviews WHERE user_id = $1 AND tour_id = $2) as tour_review_count,
        (SELECT COUNT(*) FROM destination_reviews WHERE user_id = $1 AND booking_id = $3) as destination_review_count
    `;
    const existingReviews = await db.query(existingReviewsQuery, [userId, booking.tour_id, bookingId]);

    // Récupérer les avis addons existants
    const existingAddonReviewsQuery = `
      SELECT addon_id, rating, comment
      FROM addon_reviews
      WHERE user_id = $1 AND booking_id = $2
    `;
    const existingAddonReviews = await db.query(existingAddonReviewsQuery, [userId, bookingId]);

    // Récupérer les avis véhicules existants
    const existingVehicleReviewsQuery = `
      SELECT vehicle_id, rating, comment
      FROM vehicle_reviews
      WHERE user_id = $1 AND booking_id = $2
    `;
    const existingVehicleReviews = await db.query(existingVehicleReviewsQuery, [userId, bookingId]);

    res.status(200).json({
      success: true,
      data: {
        booking: {
          id: booking.id,
          reference: booking.booking_reference,
          travel_date: booking.travel_date,
          tour: {
            id: booking.tour_id,
            name: booking.tour_name,
            image: booking.tour_image
          },
          destination: destinationDetails,
          addons: addonsDetails,
          vehicles: vehiclesDetails
        },
        existingReviews: {
          tourReviewed: existingReviews.rows[0].tour_review_count > 0,
          destinationReviewed: existingReviews.rows[0].destination_review_count > 0,
          addonReviews: existingAddonReviews.rows,
          vehicleReviews: existingVehicleReviews.rows
        }
      }
    });

  } catch (error) {
    console.error('Error fetching booking review details:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Soumettre tous les avis pour une réservation
 * @route POST /api/booking-reviews/:bookingId/submit
 * @access Private
 */
exports.submitBookingReviews = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const { tourReview, destinationReview, addonReviews, vehicleReviews } = req.body;

    // Vérifier que la réservation appartient à l'utilisateur et est complétée
    const bookingCheck = await client.query(
      `SELECT b.id, b.tour_id, td.destination_id
       FROM bookings b
       JOIN tours t ON b.tour_id = t.id
       LEFT JOIN tour_destinations td ON t.id = td.tour_id
       WHERE b.id = $1 AND b.user_id = $2 AND b.status = 'Trip Completed'`,
      [bookingId, userId]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or not completed'
      });
    }

    const booking = bookingCheck.rows[0];

    await client.query('BEGIN');

    const results = {
      tourReview: null,
      destinationReview: null,
      addonReviews: [],
      vehicleReviews: []
    };

    // 1. Avis sur le tour
    if (tourReview && tourReview.rating) {
      // Vérifier si l'avis existe déjà
      const existingTourReview = await client.query(
        'SELECT id FROM reviews WHERE user_id = $1 AND tour_id = $2',
        [userId, booking.tour_id]
      );

      if (existingTourReview.rows.length === 0) {
        const tourReviewQuery = `
          INSERT INTO reviews (
            user_id, tour_id, rating, review_text,
            travel_date, verified_purchase, is_approved,
            would_recommend, submission_date
          )
          VALUES ($1, $2, $3, $4, $5, true, false, $6, NOW())
          RETURNING id, rating, review_text, submission_date
        `;

        const tourReviewResult = await client.query(tourReviewQuery, [
          userId,
          booking.tour_id,
          tourReview.rating,
          tourReview.comment || '',
          tourReview.travel_date || null,
          tourReview.would_recommend !== undefined ? tourReview.would_recommend : true
        ]);

        results.tourReview = tourReviewResult.rows[0];
      } else {
        results.tourReview = { alreadyExists: true };
      }
    }

    // 2. Avis sur la destination
    if (destinationReview && destinationReview.rating && booking.destination_id) {
      // Vérifier si l'avis existe déjà
      const existingDestReview = await client.query(
        'SELECT id FROM destination_reviews WHERE user_id = $1 AND booking_id = $2 AND destination_id = $3',
        [userId, bookingId, booking.destination_id]
      );

      if (existingDestReview.rows.length === 0) {
        const destReviewQuery = `
          INSERT INTO destination_reviews (
            destination_id, booking_id, user_id, rating, comment, created_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW())
          RETURNING id, rating, comment, created_at
        `;

        const destReviewResult = await client.query(destReviewQuery, [
          booking.destination_id,
          bookingId,
          userId,
          destinationReview.rating,
          destinationReview.comment || ''
        ]);

        results.destinationReview = destReviewResult.rows[0];
      } else {
        results.destinationReview = { alreadyExists: true };
      }
    }

    // 3. Avis sur les addons
    if (addonReviews && Array.isArray(addonReviews) && addonReviews.length > 0) {
      for (const addonReview of addonReviews) {
        if (addonReview.addon_id && addonReview.rating) {
          // Vérifier si l'avis existe déjà
          const existingAddonReview = await client.query(
            'SELECT id FROM addon_reviews WHERE user_id = $1 AND booking_id = $2 AND addon_id = $3',
            [userId, bookingId, addonReview.addon_id]
          );

          if (existingAddonReview.rows.length === 0) {
            const addonReviewQuery = `
              INSERT INTO addon_reviews (
                addon_id, booking_id, user_id, rating, comment, created_at
              )
              VALUES ($1, $2, $3, $4, $5, NOW())
              RETURNING id, addon_id, rating, comment, created_at
            `;

            const addonReviewResult = await client.query(addonReviewQuery, [
              addonReview.addon_id,
              bookingId,
              userId,
              addonReview.rating,
              addonReview.comment || ''
            ]);

            results.addonReviews.push(addonReviewResult.rows[0]);
          } else {
            results.addonReviews.push({ addon_id: addonReview.addon_id, alreadyExists: true });
          }
        }
      }
    }

    // 4. Avis sur les véhicules
    if (vehicleReviews && Array.isArray(vehicleReviews) && vehicleReviews.length > 0) {
      for (const vehicleReview of vehicleReviews) {
        if (vehicleReview.vehicle_id && vehicleReview.rating) {
          // Vérifier si l'avis existe déjà
          const existingVehicleReview = await client.query(
            'SELECT id FROM vehicle_reviews WHERE user_id = $1 AND booking_id = $2 AND vehicle_id = $3',
            [userId, bookingId, vehicleReview.vehicle_id]
          );

          if (existingVehicleReview.rows.length === 0) {
            const vehicleReviewQuery = `
              INSERT INTO vehicle_reviews (
                vehicle_id, booking_id, user_id, rating, comment, created_at
              )
              VALUES ($1, $2, $3, $4, $5, NOW())
              RETURNING id, vehicle_id, rating, comment, created_at
            `;

            const vehicleReviewResult = await client.query(vehicleReviewQuery, [
              vehicleReview.vehicle_id,
              bookingId,
              userId,
              vehicleReview.rating,
              vehicleReview.comment || ''
            ]);

            results.vehicleReviews.push(vehicleReviewResult.rows[0]);
          } else {
            results.vehicleReviews.push({ vehicle_id: vehicleReview.vehicle_id, alreadyExists: true });
          }
        }
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Reviews submitted successfully',
      data: results
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting booking reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * @description Vérifier si l'utilisateur peut laisser un avis pour une réservation
 * @route GET /api/booking-reviews/:bookingId/can-review
 * @access Private
 */
exports.canReviewBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT
        b.id,
        b.status,
        b.completion_date,
        CASE WHEN b.status = 'Trip Completed' THEN true ELSE false END as can_review
      FROM bookings b
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const result = await db.query(query, [bookingId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;
