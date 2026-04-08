const express = require("express");
const bookingController = require("../controllers/bookingController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// --- Client Routes ---
router.post("/", protect, bookingController.createBookingInquiry);
router.get("/my-bookings", protect, bookingController.getUserBookings);
router.get("/stats", protect, bookingController.getBookingStats);

// NEW ROUTE: Cancel a booking (before payment)
router.patch(
  "/:bookingId/cancel",
  protect,
  bookingController.cancelBookingByUser
);

// --- Admin Routes ---
// Route to update a booking's status.
// Only an admin can perform this action.
router.patch(
  "/:bookingId/status",
  protect,
  isAdmin,
  bookingController.updateBookingStatus
);

// Route to get all bookings with enhanced filtering (Admin only)
router.get(
  "/admin/all",
  protect,
  isAdmin,
  bookingController.getAllBookingsEnriched
);

// Route to get admin booking statistics
router.get(
  "/admin/stats",
  protect,
  isAdmin,
  bookingController.getAdminBookingStats
);

// Route to get single booking by ID (Admin only)
router.get(
  "/admin/:bookingId",
  protect,
  isAdmin,
  bookingController.getBookingById
);

// Admin: Delete a booking - MUST be before more specific routes
router.delete(
  "/:bookingId",
  protect,
  isAdmin,
  bookingController.deleteBooking
);

// Admin: Send quote to customer
router.put(
  "/:bookingId/send-quote",
  protect,
  isAdmin,
  bookingController.sendQuoteToCustomer
);

// Admin: Mark trip as completed
router.put(
  "/:bookingId/complete",
  protect,
  isAdmin,
  bookingController.markTripCompleted
);

module.exports = router;
