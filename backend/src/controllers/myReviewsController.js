const db = require('../db');

/**
 * Contrôleur pour gérer TOUS les avis d'un utilisateur
 * Tours, Destinations, Addons, Véhicules
 */

/**
 * @description Récupérer tous les avis de l'utilisateur (tous types)
 * @route GET /api/my-reviews/all
 * @access Private
 */
exports.getAllMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Avis des tours
    const tourReviewsQuery = `
      SELECT
        r.id,
        r.tour_id,
        r.rating,
        r.review_text as comment,
        r.submission_date as created_at,
        r.would_recommend,
        r.travel_date,
        r.is_approved,
        t.name as tour_name,
        t.main_image_url as tour_image,
        'tour' as review_type
      FROM reviews r
      JOIN tours t ON r.tour_id = t.id
      WHERE r.user_id = $1
      ORDER BY r.submission_date DESC
    `;

    // 2. Avis des destinations
    const destinationReviewsQuery = `
      SELECT
        dr.id,
        dr.destination_id,
        dr.rating,
        dr.comment,
        dr.created_at,
        dr.booking_id,
        d.name as destination_name,
        d.country,
        d.thumbnail_image as destination_image,
        b.booking_reference,
        'destination' as review_type
      FROM destination_reviews dr
      JOIN destinations d ON dr.destination_id = d.id
      JOIN bookings b ON dr.booking_id = b.id
      WHERE dr.user_id = $1
      ORDER BY dr.created_at DESC
    `;

    // 3. Avis des addons
    const addonReviewsQuery = `
      SELECT
        ar.id,
        ar.addon_id,
        ar.rating,
        ar.comment,
        ar.created_at,
        ar.updated_at,
        ar.booking_id,
        a.name as addon_name,
        a.category as addon_category,
        b.booking_reference,
        t.name as tour_name,
        b.travel_date,
        'addon' as review_type
      FROM addon_reviews ar
      JOIN addons a ON ar.addon_id = a.id
      JOIN bookings b ON ar.booking_id = b.id
      JOIN tours t ON b.tour_id = t.id
      WHERE ar.user_id = $1
      ORDER BY ar.created_at DESC
    `;

    // 4. Avis des véhicules
    const vehicleReviewsQuery = `
      SELECT
        vr.id,
        vr.vehicle_id,
        vr.rating,
        vr.comment,
        vr.created_at,
        vr.updated_at,
        vr.booking_id,
        v.name as vehicle_name,
        v.type as vehicle_type,
        v.comfort_level,
        v.image_url as vehicle_image,
        b.booking_reference,
        t.name as tour_name,
        b.travel_date,
        'vehicle' as review_type
      FROM vehicle_reviews vr
      JOIN vehicles v ON vr.vehicle_id = v.id
      JOIN bookings b ON vr.booking_id = b.id
      JOIN tours t ON b.tour_id = t.id
      WHERE vr.user_id = $1
      ORDER BY vr.created_at DESC
    `;

    const [tourReviews, destinationReviews, addonReviews, vehicleReviews] = await Promise.all([
      db.query(tourReviewsQuery, [userId]),
      db.query(destinationReviewsQuery, [userId]),
      db.query(addonReviewsQuery, [userId]),
      db.query(vehicleReviewsQuery, [userId])
    ]);

    res.status(200).json({
      success: true,
      data: {
        tours: tourReviews.rows,
        destinations: destinationReviews.rows,
        addons: addonReviews.rows,
        vehicles: vehicleReviews.rows,
        stats: {
          totalReviews: tourReviews.rows.length + destinationReviews.rows.length + addonReviews.rows.length + vehicleReviews.rows.length,
          tourReviews: tourReviews.rows.length,
          destinationReviews: destinationReviews.rows.length,
          addonReviews: addonReviews.rows.length,
          vehicleReviews: vehicleReviews.rows.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Supprimer un avis de tour
 * @route DELETE /api/my-reviews/tour/:reviewId
 * @access Private
 */
exports.deleteTourReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'avis appartient à l'utilisateur
    const checkQuery = 'SELECT id FROM reviews WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [reviewId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or unauthorized'
      });
    }

    // Supprimer l'avis
    await db.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    res.status(200).json({
      success: true,
      message: 'Tour review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tour review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * @description Supprimer un avis de destination
 * @route DELETE /api/my-reviews/destination/:reviewId
 * @access Private
 */
exports.deleteDestinationReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const checkQuery = 'SELECT id FROM destination_reviews WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [reviewId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or unauthorized'
      });
    }

    await db.query('DELETE FROM destination_reviews WHERE id = $1', [reviewId]);

    res.status(200).json({
      success: true,
      message: 'Destination review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting destination review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * @description Mettre à jour un avis de tour
 * @route PUT /api/my-reviews/tour/:reviewId
 * @access Private
 */
exports.updateTourReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment, would_recommend } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Vérifier que l'avis appartient à l'utilisateur
    const checkQuery = 'SELECT id FROM reviews WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [reviewId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or unauthorized'
      });
    }

    // Mettre à jour l'avis
    const updateQuery = `
      UPDATE reviews
      SET rating = $1, review_text = $2, would_recommend = $3
      WHERE id = $4
      RETURNING id, rating, review_text, would_recommend, submission_date
    `;

    const result = await db.query(updateQuery, [
      rating,
      comment || '',
      would_recommend !== undefined ? would_recommend : true,
      reviewId
    ]);

    res.status(200).json({
      success: true,
      message: 'Tour review updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating tour review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * @description Mettre à jour un avis de destination
 * @route PUT /api/my-reviews/destination/:reviewId
 * @access Private
 */
exports.updateDestinationReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const checkQuery = 'SELECT id FROM destination_reviews WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [reviewId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or unauthorized'
      });
    }

    const updateQuery = `
      UPDATE destination_reviews
      SET rating = $1, comment = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, rating, comment, created_at, updated_at
    `;

    const result = await db.query(updateQuery, [rating, comment || '', reviewId]);

    res.status(200).json({
      success: true,
      message: 'Destination review updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating destination review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * @description Mettre à jour un avis de véhicule
 * @route PUT /api/my-reviews/vehicle/:reviewId
 * @access Private
 */
exports.updateVehicleReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const checkQuery = 'SELECT id FROM vehicle_reviews WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [reviewId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or unauthorized'
      });
    }

    const updateQuery = `
      UPDATE vehicle_reviews
      SET rating = $1, comment = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, rating, comment, created_at, updated_at
    `;

    const result = await db.query(updateQuery, [rating, comment || '', reviewId]);

    res.status(200).json({
      success: true,
      message: 'Vehicle review updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating vehicle review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * @description Supprimer un avis de véhicule
 * @route DELETE /api/my-reviews/vehicle/:reviewId
 * @access Private
 */
exports.deleteVehicleReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'avis appartient à l'utilisateur
    const checkQuery = 'SELECT id FROM vehicle_reviews WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [reviewId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or unauthorized'
      });
    }

    // Supprimer l'avis
    await db.query('DELETE FROM vehicle_reviews WHERE id = $1', [reviewId]);

    res.status(200).json({
      success: true,
      message: 'Vehicle review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting vehicle review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = exports;
