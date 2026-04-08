const express = require('express');
const addonReviewController = require('../controllers/addonReviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Routes pour la gestion des avis d'addons
 * Endpoints pour créer, lire, modifier et supprimer les avis d'addons
 */

// ============================================
// Public Routes (no authentication required)
// ============================================

// Get reviews for a specific addon with pagination
router.get('/addon/:addonId', addonReviewController.getAddonReviews);

// Get review statistics for a specific addon
router.get('/addon/:addonId/stats', addonReviewController.getAddonReviewStatistics);

// ============================================
// Protected Routes (authentication required)
// ============================================

// Get bookings eligible for addon reviews
router.get('/eligible', protect, addonReviewController.getEligibleBookings);

// Get all addon reviews by current user
router.get('/my-reviews', protect, addonReviewController.getMyAddonReviews);

// Check if user can review a specific addon for a booking
router.get(
  '/can-review/:bookingId/:addonId',
  protect,
  addonReviewController.checkReviewEligibility
);

// Create a new addon review
router.post('/', protect, addonReviewController.createAddonReview);

// Update an existing addon review
router.put('/:reviewId', protect, addonReviewController.updateAddonReview);

// Delete an addon review
router.delete('/:reviewId', protect, addonReviewController.deleteAddonReview);

module.exports = router;
