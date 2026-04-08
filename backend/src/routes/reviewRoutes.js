const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Routes pour la gestion des avis
 * Endpoints optimisés pour la page d'accueil et les détails des tours
 */

// Featured reviews for homepage
router.get('/featured', reviewController.getFeaturedReviews);

// Reviews for specific tour with pagination
router.get('/tour/:tourId', reviewController.getReviewsByTour);

// Review statistics for specific tour
router.get('/tour/:tourId/stats', reviewController.getReviewStatistics);

// Most helpful reviews across all tours
router.get('/helpful', reviewController.getMostHelpfulReviews);

// Global review statistics
router.get('/stats/global', reviewController.getGlobalReviewStatistics);

// Global recommendation statistics (Option B - automatic calculation)
router.get('/stats/recommendations/global', reviewController.getGlobalRecommendationStats);

// Tour-specific recommendation statistics
router.get('/stats/recommendations/tour/:tourId', reviewController.getTourRecommendationStats);

// Submit a new review (requires authentication)
router.post('/', protect, reviewController.submitReview);

module.exports = router;