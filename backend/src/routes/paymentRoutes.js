/**
 * Payment Routes
 * Routes pour les paiements simulés
 */

const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// USER ROUTES - Paiement

// Process card payment
router.post(
  '/:bookingId/payment/card',
  protect,
  paymentController.processCardPayment
);

// Process bank transfer (user initiates)
router.post(
  '/:bookingId/payment/bank-transfer',
  protect,
  paymentController.processBankTransfer
);

// Process PayPal payment
router.post(
  '/:bookingId/payment/paypal',
  protect,
  paymentController.processPayPalPayment
);

// Get payment details
router.get(
  '/:bookingId/payment',
  protect,
  paymentController.getPaymentDetails
);

// ADMIN ROUTES - Confirmation de paiement

// Confirm bank transfer (admin only)
router.post(
  '/admin/bookings/:bookingId/payment/confirm-bank-transfer',
  protect,
  isAdmin,
  paymentController.confirmBankTransfer
);

module.exports = router;
