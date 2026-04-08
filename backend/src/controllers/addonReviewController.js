const AddonReviewService = require('../services/addonReviewService');

/**
 * Contrôleur pour la gestion des avis d'addons
 * Permet aux utilisateurs de noter et commenter les addons après leur voyage
 */

/**
 * @description Get bookings eligible for addon reviews
 * @route GET /api/addon-reviews/eligible
 * @access Private (requires authentication)
 */
exports.getEligibleBookings = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user

    const bookings = await AddonReviewService.getEligibleBookingsForReviews(userId);

    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching eligible bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Create a new addon review
 * @route POST /api/addon-reviews
 * @access Private (requires authentication)
 */
exports.createAddonReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addon_id, booking_id, rating, comment } = req.body;

    // Validation
    if (!addon_id || !booking_id || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['addon_id', 'booking_id', 'rating']
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const result = await AddonReviewService.createAddonReview({
      userId,
      addonId: addon_id,
      bookingId: booking_id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Addon review created successfully',
      data: result.review,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating addon review:', error);

    if (error.message.includes('Cannot review')) {
      return res.status(403).json({
        success: false,
        error: 'Not eligible to review this addon',
        message: error.message
      });
    }

    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: 'You have already reviewed this addon for this booking'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get reviews for a specific addon
 * @route GET /api/addon-reviews/addon/:addonId
 * @access Public
 */
exports.getAddonReviews = async (req, res) => {
  try {
    const { addonId } = req.params;
    const options = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
      sortBy: req.query.sortBy || 'newest'
    };

    const result = await AddonReviewService.getAddonReviews(parseInt(addonId), options);

    res.status(200).json({
      success: true,
      addonId: parseInt(addonId),
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching addon reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get review statistics for a specific addon
 * @route GET /api/addon-reviews/addon/:addonId/stats
 * @access Public
 */
exports.getAddonReviewStatistics = async (req, res) => {
  try {
    const { addonId } = req.params;
    const stats = await AddonReviewService.getAddonReviewStatistics(parseInt(addonId));

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching addon review statistics:', error);

    if (error.message === 'Addon not found') {
      return res.status(404).json({
        success: false,
        error: 'Addon not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Update an existing addon review
 * @route PUT /api/addon-reviews/:reviewId
 * @access Private (requires authentication)
 */
exports.updateAddonReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const result = await AddonReviewService.updateAddonReview(
      parseInt(reviewId),
      userId,
      { rating, comment }
    );

    res.status(200).json({
      success: true,
      message: 'Addon review updated successfully',
      data: result.review,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating addon review:', error);

    if (error.message.includes('not found or unauthorized')) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or you are not authorized to update it'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Delete an addon review
 * @route DELETE /api/addon-reviews/:reviewId
 * @access Private (requires authentication)
 */
exports.deleteAddonReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const result = await AddonReviewService.deleteAddonReview(parseInt(reviewId), userId);

    res.status(200).json({
      success: true,
      message: 'Addon review deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting addon review:', error);

    if (error.message.includes('not found or unauthorized')) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or you are not authorized to delete it'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get all addon reviews by current user
 * @route GET /api/addon-reviews/my-reviews
 * @access Private (requires authentication)
 */
exports.getMyAddonReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await AddonReviewService.getUserAddonReviews(userId);

    res.status(200).json({
      success: true,
      data: reviews,
      count: reviews.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user addon reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Check if user can review a specific addon for a booking
 * @route GET /api/addon-reviews/can-review/:bookingId/:addonId
 * @access Private (requires authentication)
 */
exports.checkReviewEligibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, addonId } = req.params;

    const eligibility = await AddonReviewService.canUserReviewAddon(
      userId,
      parseInt(addonId),
      parseInt(bookingId)
    );

    res.status(200).json({
      success: true,
      ...eligibility,
      timestamp: new Date().toISOString()
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
