const express = require("express");
const quoteRevisionController = require("../controllers/quoteRevisionController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// --- All routes are admin-only ---

// Start a new quote review for a booking
router.post(
  "/:bookingId/review/start",
  protect,
  isAdmin,
  quoteRevisionController.startBookingReview
);

// Get active revision for a booking
router.get(
  "/:bookingId/review/active",
  protect,
  isAdmin,
  quoteRevisionController.getActiveRevision
);

// Get latest revision for a booking (regardless of status)
router.get(
  "/:bookingId/review/latest",
  protect,
  isAdmin,
  quoteRevisionController.getLatestRevision
);

// Get revision history for a booking
router.get(
  "/:bookingId/review/history",
  protect,
  isAdmin,
  quoteRevisionController.getRevisionHistory
);

// Update tier validation
router.patch(
  "/:bookingId/review/:revisionId/tier",
  protect,
  isAdmin,
  quoteRevisionController.updateTierValidation
);

// Update vehicles validation
router.patch(
  "/:bookingId/review/:revisionId/vehicles",
  protect,
  isAdmin,
  quoteRevisionController.updateVehiclesValidation
);

// Update add-ons validation
router.patch(
  "/:bookingId/review/:revisionId/addons",
  protect,
  isAdmin,
  quoteRevisionController.updateAddonsValidation
);

// Update participants validation
router.patch(
  "/:bookingId/review/:revisionId/participants",
  protect,
  isAdmin,
  quoteRevisionController.updateParticipantsValidation
);

// Update dates validation
router.patch(
  "/:bookingId/review/:revisionId/dates",
  protect,
  isAdmin,
  quoteRevisionController.updateDatesValidation
);

// Update pricing
router.patch(
  "/:bookingId/review/:revisionId/pricing",
  protect,
  isAdmin,
  quoteRevisionController.updatePricing
);

// Add discount
router.post(
  "/:bookingId/review/:revisionId/discounts",
  protect,
  isAdmin,
  quoteRevisionController.addDiscount
);

// Add fee
router.post(
  "/:bookingId/review/:revisionId/fees",
  protect,
  isAdmin,
  quoteRevisionController.addFee
);

// Update review status
router.patch(
  "/:bookingId/review/:revisionId/status",
  protect,
  isAdmin,
  quoteRevisionController.updateReviewStatus
);

// Get all active reviews (admin dashboard)
router.get(
  "/admin/reviews/active",
  protect,
  isAdmin,
  quoteRevisionController.getAllActiveReviews
);

// Run automatic validation
router.post(
  "/:bookingId/review/validate",
  protect,
  isAdmin,
  quoteRevisionController.runAutoValidation
);

// Calculate quote pricing
router.post(
  "/:bookingId/review/calculate-price",
  protect,
  isAdmin,
  quoteRevisionController.calculatePrice
);

// Run auto-validation and save to revision
router.post(
  "/:bookingId/review/:revisionId/auto-validate",
  protect,
  isAdmin,
  quoteRevisionController.runAutoValidationAndSave
);

// CREATE NEW REVISION (when modifying an already-sent quote)
router.post(
  "/:bookingId/review/new-revision",
  protect,
  isAdmin,
  quoteRevisionController.createNewRevision
);

// UPDATE VEHICLES WITH DETAILED QUANTITIES AND PRICES
router.patch(
  "/:bookingId/review/:revisionId/vehicles-detailed",
  protect,
  isAdmin,
  quoteRevisionController.updateVehiclesDetailed
);

// UPDATE ADDONS WITH DETAILED QUANTITIES AND PRICES
router.patch(
  "/:bookingId/review/:revisionId/addons-detailed",
  protect,
  isAdmin,
  quoteRevisionController.updateAddonsDetailed
);

// SEND QUOTE TO CUSTOMER (generates PDFs and emails)
router.post(
  "/:bookingId/review/:revisionId/send-quote",
  protect,
  isAdmin,
  quoteRevisionController.sendQuoteToCustomer
);

module.exports = router;
