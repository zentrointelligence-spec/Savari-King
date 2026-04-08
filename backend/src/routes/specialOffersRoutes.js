const express = require('express');
const router = express.Router();
const specialOffersController = require('../controllers/specialOffersController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

/**
 * Special Offers Routes for Quote Review
 * These routes are used by admins during quote review to apply special offers
 */

// Get applicable offers for a specific booking/revision
router.get(
  '/bookings/:bookingId/review/:revisionId/applicable-offers',
  protect,
  isAdmin,
  specialOffersController.getApplicableOffersForReview
);

// Apply selected offers to a revision (manual selection)
router.post(
  '/bookings/:bookingId/review/:revisionId/apply-offers',
  protect,
  isAdmin,
  specialOffersController.applyOffersToRevision
);

// Auto-apply best offers to a revision (automatic)
router.post(
  '/bookings/:bookingId/review/:revisionId/auto-apply-offers',
  protect,
  isAdmin,
  specialOffersController.autoApplyBestOffers
);

// Remove all applied offers from a revision
router.delete(
  '/bookings/:bookingId/review/:revisionId/applied-offers',
  protect,
  isAdmin,
  specialOffersController.removeAppliedOffers
);

module.exports = router;
