/**
 * Email Logs Routes
 * Routes pour la visualisation des logs d'emails
 */

const express = require('express');
const emailLogsController = require('../controllers/emailLogsController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// ADMIN ROUTES - Logs d'emails

// Get all email logs (admin only)
router.get(
  '/admin/email-logs',
  protect,
  isAdmin,
  emailLogsController.getAllEmailLogs
);

// Get email stats (admin only)
router.get(
  '/admin/email-logs/stats',
  protect,
  isAdmin,
  emailLogsController.getEmailStats
);

// Get specific email log details (admin only)
router.get(
  '/admin/email-logs/:emailLogId',
  protect,
  isAdmin,
  emailLogsController.getEmailLogDetails
);

// USER ROUTES - Logs d'emails pour leur booking

// Get email logs for a specific booking
router.get(
  '/bookings/:bookingId/email-logs',
  protect,
  emailLogsController.getEmailLogsByBooking
);

module.exports = router;
