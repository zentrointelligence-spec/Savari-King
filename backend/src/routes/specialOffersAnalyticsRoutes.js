const express = require('express');
const router = express.Router();
const specialOffersAnalyticsController = require('../controllers/specialOffersAnalyticsController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

/**
 * Special Offers Analytics Routes
 * Analytics and reporting for special offers performance
 */

// Get overview statistics
router.get(
  '/analytics/special-offers/overview',
  protect,
  isAdmin,
  specialOffersAnalyticsController.getOffersOverview
);

// Get top performing offers
router.get(
  '/analytics/special-offers/top-performers',
  protect,
  isAdmin,
  specialOffersAnalyticsController.getTopPerformingOffers
);

// Get offers breakdown by type
router.get(
  '/analytics/special-offers/by-type',
  protect,
  isAdmin,
  specialOffersAnalyticsController.getOffersByType
);

// Get revenue impact
router.get(
  '/analytics/special-offers/revenue-impact',
  protect,
  isAdmin,
  specialOffersAnalyticsController.getRevenueImpact
);

// Get usage timeline
router.get(
  '/analytics/special-offers/timeline',
  protect,
  isAdmin,
  specialOffersAnalyticsController.getOffersTimeline
);

module.exports = router;
