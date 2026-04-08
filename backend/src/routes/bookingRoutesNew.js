/**
 * Booking Routes - Complete Implementation
 * Based on BOOKING_LOGIC_COMPLETE.md plan
 */

const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingControllerNew");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// ==================== ADMIN ROUTES (MUST BE BEFORE DYNAMIC ROUTES) ====================

/**
 * @route   GET /api/bookings/admin/all
 * @desc    Get all bookings with filters (Admin)
 * @access  Private + Admin only
 */
router.get("/admin/all", protect, isAdmin, bookingController.getAllBookings);

/**
 * @route   GET /api/bookings/admin/stats
 * @desc    Get booking statistics (Admin)
 * @access  Private + Admin only
 */
router.get("/admin/stats", protect, isAdmin, bookingController.getBookingStats);

/**
 * @route   GET /api/bookings/admin/:id
 * @desc    Get single booking by ID (Admin)
 * @access  Private + Admin only
 */
router.get("/admin/:id", protect, isAdmin, bookingController.getBookingByIdAdmin);

// ==================== USER ROUTES ====================

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking inquiry (Status: Inquiry Pending)
 * @access  Private (Authenticated users only)
 */
router.post("/", protect, bookingController.createBookingInquiry);

/**
 * @route   GET /api/bookings/user
 * @desc    Get all bookings for the current user
 * @access  Private (Authenticated users only)
 */
router.get("/user", protect, bookingController.getUserBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details by ID
 * @access  Private (Own bookings only)
 */
router.get("/:id", protect, bookingController.getBookingById);

/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private (Own bookings only)
 */
router.post("/:id/cancel", protect, bookingController.cancelBooking);

/**
 * @route   PUT /api/bookings/:id/send-quote
 * @desc    Send quote to customer (Admin) - Changes status to "Quote Sent"
 * @access  Private + Admin only
 */
router.put("/:id/send-quote", protect, isAdmin, bookingController.sendQuote);

/**
 * @route   PUT /api/bookings/:id/complete
 * @desc    Mark booking as completed (Admin) - Changes status to "Trip Completed"
 * @access  Private + Admin only
 */
router.put("/:id/complete", protect, isAdmin, bookingController.completeBooking);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete a booking (Admin only)
 * @access  Private + Admin only
 */
router.delete("/:id", protect, isAdmin, bookingController.deleteBooking);

module.exports = router;
