const express = require('express');
const bookingReviewController = require('../controllers/bookingReviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Routes pour la gestion des avis de réservations complétées
 * Permet de laisser des avis sur le tour, les addons et la destination
 */

// Récupérer les détails d'une réservation pour le formulaire d'avis
router.get('/:bookingId/details', protect, bookingReviewController.getBookingReviewDetails);

// Soumettre tous les avis pour une réservation
router.post('/:bookingId/submit', protect, bookingReviewController.submitBookingReviews);

// Vérifier si l'utilisateur peut laisser un avis pour une réservation
router.get('/:bookingId/can-review', protect, bookingReviewController.canReviewBooking);

module.exports = router;
