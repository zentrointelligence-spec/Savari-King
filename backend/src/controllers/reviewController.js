const ReviewService = require('../services/reviewService');

/**
 * Contrôleur pour la gestion des avis avec endpoints optimisés
 * Utilise le ReviewService pour la logique métier
 */

/**
 * @description Get featured reviews for homepage
 * @route GET /api/reviews/featured
 * @access Public
 */
exports.getFeaturedReviews = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const reviews = await ReviewService.getFeaturedReviews(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: reviews,
      count: reviews.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching featured reviews:', error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get reviews for a specific tour with pagination
 * @route GET /api/reviews/tour/:tourId
 * @access Public
 */
exports.getReviewsByTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    const options = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
      sortBy: req.query.sortBy || 'newest',
      minRating: req.query.minRating ? parseInt(req.query.minRating) : 1
    };

    const result = await ReviewService.getReviewsByTour(parseInt(tourId), options);
    
    res.status(200).json({
      success: true,
      ...result,
      tourId: parseInt(tourId),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching tour reviews:', error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get detailed review statistics for a tour
 * @route GET /api/reviews/tour/:tourId/stats
 * @access Public
 */
exports.getReviewStatistics = async (req, res) => {
  try {
    const { tourId } = req.params;
    const stats = await ReviewService.getReviewStatistics(parseInt(tourId));
    
    res.status(200).json({
      success: true,
      data: stats,
      tourId: parseInt(tourId),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get most helpful reviews across all tours
 * @route GET /api/reviews/helpful
 * @access Public
 */
exports.getMostHelpfulReviews = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const reviews = await ReviewService.getMostHelpfulReviews(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: reviews,
      count: reviews.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching most helpful reviews:', error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get global review statistics
 * @route GET /api/reviews/stats/global
 * @access Public
 */
exports.getGlobalReviewStatistics = async (req, res) => {
  try {
    const stats = await ReviewService.getGlobalReviewStatistics();

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching global review statistics:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Submit a new review for a completed tour
 * @route POST /api/reviews
 * @access Private (requires authentication)
 */
exports.submitReview = async (req, res) => {
  try {
    const { tourId, rating, reviewText, travelDate } = req.body;
    const userId = req.user.id; // Assumes authentication middleware sets req.user

    // Validation
    if (!tourId || !rating || !reviewText) {
      return res.status(400).json({
        success: false,
        error: "Tour ID, rating, and review text are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5"
      });
    }

    // Check if user has a completed booking for this tour
    const pool = require('../db');
    const bookingCheck = await pool.query(
      `SELECT id FROM bookings
       WHERE user_id = $1 AND tour_id = $2 AND status = 'Completed'
       LIMIT 1`,
      [userId, tourId]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: "You can only review tours you have completed"
      });
    }

    // Check if user has already reviewed this tour
    const existingReview = await pool.query(
      `SELECT id FROM reviews WHERE user_id = $1 AND tour_id = $2`,
      [userId, tourId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this tour"
      });
    }

    // Insert the review
    const insertQuery = `
      INSERT INTO reviews (
        user_id, tour_id, rating, review_text, travel_date,
        verified_purchase, is_approved, submission_date
      ) VALUES ($1, $2, $3, $4, $5, true, false, NOW())
      RETURNING id, rating, review_text, submission_date, verified_purchase
    `;

    const result = await pool.query(insertQuery, [
      userId,
      tourId,
      rating,
      reviewText,
      travelDate || null
    ]);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully and is pending approval",
      data: {
        id: result.rows[0].id,
        rating: result.rows[0].rating,
        reviewText: result.rows[0].review_text,
        submissionDate: result.rows[0].submission_date,
        verifiedPurchase: result.rows[0].verified_purchase,
        status: 'pending_approval'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get global recommendation statistics
 * @route GET /api/reviews/stats/recommendations/global
 * @access Public
 */
exports.getGlobalRecommendationStats = async (req, res) => {
  try {
    const stats = await ReviewService.getGlobalRecommendationStats();

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching global recommendation stats:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get recommendation statistics for a specific tour
 * @route GET /api/reviews/stats/recommendations/tour/:tourId
 * @access Public
 */
exports.getTourRecommendationStats = async (req, res) => {
  try {
    const { tourId} = req.params;
    const stats = await ReviewService.getTourRecommendationStats(parseInt(tourId));

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching tour recommendation stats:', error);
    const statusCode = error.message === 'Tour not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};