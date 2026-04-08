const express = require('express');
const router = express.Router();
const myReviewsController = require('../controllers/myReviewsController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Routes pour gérer TOUS les avis d'un utilisateur
 * Tours, Destinations, Addons, Véhicules
 */

/**
 * @route   GET /api/my-reviews/all
 * @desc    Récupérer tous les avis de l'utilisateur (tous types)
 * @access  Private
 */
router.get('/all', protect, myReviewsController.getAllMyReviews);

/**
 * @route   PUT /api/my-reviews/tour/:reviewId
 * @desc    Mettre à jour un avis de tour
 * @access  Private
 */
router.put('/tour/:reviewId', protect, myReviewsController.updateTourReview);

/**
 * @route   DELETE /api/my-reviews/tour/:reviewId
 * @desc    Supprimer un avis de tour
 * @access  Private
 */
router.delete('/tour/:reviewId', protect, myReviewsController.deleteTourReview);

/**
 * @route   PUT /api/my-reviews/destination/:reviewId
 * @desc    Mettre à jour un avis de destination
 * @access  Private
 */
router.put('/destination/:reviewId', protect, myReviewsController.updateDestinationReview);

/**
 * @route   DELETE /api/my-reviews/destination/:reviewId
 * @desc    Supprimer un avis de destination
 * @access  Private
 */
router.delete('/destination/:reviewId', protect, myReviewsController.deleteDestinationReview);

/**
 * @route   PUT /api/my-reviews/vehicle/:reviewId
 * @desc    Mettre à jour un avis de véhicule
 * @access  Private
 */
router.put('/vehicle/:reviewId', protect, myReviewsController.updateVehicleReview);

/**
 * @route   DELETE /api/my-reviews/vehicle/:reviewId
 * @desc    Supprimer un avis de véhicule
 * @access  Private
 */
router.delete('/vehicle/:reviewId', protect, myReviewsController.deleteVehicleReview);

module.exports = router;
