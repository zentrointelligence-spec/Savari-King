const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const quoteViewController = require('../controllers/quoteViewController');

/**
 * @route   GET /api/my-bookings/:bookingId/quote/detailed
 * @desc    Get detailed quote data for web view
 * @access  Private (client only, own booking)
 */
router.get('/:bookingId/quote/detailed', protect, quoteViewController.getDetailedQuote);

/**
 * @route   GET /api/my-bookings/:bookingId/quote/general
 * @desc    Get general quote data for web view
 * @access  Private (client only, own booking)
 */
router.get('/:bookingId/quote/general', protect, quoteViewController.getGeneralQuote);

/**
 * @route   GET /api/my-bookings/:bookingId/quote/versions
 * @desc    Get all quote versions for a booking
 * @access  Private (client only, own booking)
 */
router.get('/:bookingId/quote/versions', protect, quoteViewController.getQuoteVersions);

/**
 * @route   POST /api/my-bookings/:bookingId/quote/accept
 * @desc    Accept a quote revision
 * @access  Private (client only, own booking)
 */
router.post('/:bookingId/quote/accept', protect, quoteViewController.acceptQuote);

module.exports = router;
