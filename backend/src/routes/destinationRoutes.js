// ======================================================================
// FILE: `backend/src/routes/destinationRoutes.js`
// Role: Defines the public URLs for accessing destination information.
// ======================================================================

const express = require("express");
const destinationController = require("../controllers/destinationController");
const { protect } = require("../middleware/authMiddleware");
const {
  cachePopularDestinations,
  cacheDestinationDetails,
  cacheSearchResults
} = require("../middleware/cacheMiddleware");

const router = express.Router();

// --- Routes Publiques (accessibles à tous) ---

// Route pour récupérer les destinations populaires (nouvelle API principale)
// GET /api/destinations/popular - Cached for 2 hours
router.get("/popular", cachePopularDestinations, destinationController.getPopularDestinations);

// Route pour récupérer les destinations en vedette
// GET /api/destinations/featured - Cached for 2 hours
router.get("/featured", cachePopularDestinations, destinationController.getFeaturedDestinations);

// Route pour récupérer les destinations tendance
// GET /api/destinations/trending - Cached for 2 hours
router.get("/trending", cachePopularDestinations, destinationController.getTrendingDestinations);

// Route pour récupérer les top destinations (legacy - rétrocompatibilité)
// GET /api/destinations/top - Cached for 2 hours
router.get("/top", cachePopularDestinations, destinationController.getTopDestinations);

// Route pour recherche avancée
// POST /api/destinations/search - Cached for 15 minutes
router.post("/search", cacheSearchResults, destinationController.searchDestinations);

// Route pour récupérer toutes les destinations avec filtres
// GET /api/destinations
router.get("/", destinationController.getAllDestinations);

// --- Routes Protégées (nécessitent d'être connecté) ---

// Route pour synchroniser les likes locaux lors de la connexion
// POST /api/destinations/sync-likes
router.post("/sync-likes", protect, destinationController.syncLocalLikes);

// Route pour récupérer les destinations likées par l'utilisateur
// GET /api/destinations/liked (MUST BE BEFORE /:id)
router.get("/liked", protect, destinationController.getUserLikedDestinations);

// --- Routes avec paramètres dynamiques (MUST BE LAST) ---

// Route pour récupérer une destination par slug
// GET /api/destinations/slug/:slug - Cached for 1 hour
router.get("/slug/:slug", cacheDestinationDetails, destinationController.getDestinationBySlug);

// Route pour récupérer les destinations associées
// GET /api/destinations/:id/related - Cached for 1 hour
router.get("/:id/related", cacheDestinationDetails, destinationController.getRelatedDestinations);

// Route pour récupérer les destinations à proximité
// GET /api/destinations/:id/nearby - Cached for 1 hour
router.get("/:id/nearby", cacheDestinationDetails, destinationController.getNearbyDestinations);

// Route pour récupérer les statistiques d'une destination
// GET /api/destinations/:id/stats - Cached for 1 hour
router.get("/:id/stats", cacheDestinationDetails, destinationController.getDestinationStats);

// Route pour gérer les likes (toggle) - No cache (user-specific)
// POST /api/destinations/:id/like
router.post("/:id/like", protect, destinationController.toggleDestinationLike);

// Route pour récupérer une destination par ID
// GET /api/destinations/:id (MUST BE LAST) - Cached for 1 hour
router.get("/:id", cacheDestinationDetails, destinationController.getDestinationById);

module.exports = router;