// ======================================================================
// FILE: `backend/src/routes/tourRoutes.js`
// Role: Defines the public URLs for accessing tour information.
// ======================================================================

const express = require("express");
const tourController = require("../controllers/tourController");
const { protect, optionalAuth, isAdmin } = require("../middleware/authMiddleware");
// Note: Admin-specific routes like create, update, delete will be in adminRoutes.js

const router = express.Router();

// --- Routes Publiques (accessibles à tous) ---
// Defines the route GET /api/tours
// This will be called by the homepage.
router.get("/", tourController.getActiveTours);

// Route for getting featured tours
router.get("/featured", tourController.getFeaturedTours);

// Route for getting new tours
router.get("/new", tourController.getNewTours);

// Route for getting trending tours
router.get("/trending", tourController.getTrendingTours);

// Route for getting tour categories with counts
router.get("/categories", tourController.getTourCategories);

// Route for advanced search with more filters
router.get("/advanced-search", tourController.advancedSearchTours);

// Route for getting global statistics
router.get("/statistics/global", tourController.getGlobalStatistics);

// Route for getting tours by category
router.get("/category/:categorySlug", tourController.getToursByCategory);

// Defines the route GET /api/tours/:id (e.g., /api/tours/1)
// This will be called by the tour detail page.
router.get("/:id", tourController.getTourById);

// Route for getting similar tours
router.get("/:id/similar", tourController.getSimilarTours);

// Route for getting tour tiers (packages)
router.get("/:id/tiers", tourController.getTourTiers);

// Ces routes sont commentées car les fonctions correspondantes n'existent pas encore dans le contrôleur
// router.get("/:id/availability", tourController.checkTourAvailability);
// router.get("/:id/pricing/group", tourController.calculateGroupPricing);

// Route for logging a tour view - accepts both authenticated and non-authenticated users
router.post("/:tourId/view", optionalAuth, tourController.logTourView);

// Route for getting tour accommodations (package tiers with accommodation details)
router.get("/:tourId/accommodations", tourController.getTourAccommodations);

// Route for getting tour addons
router.get("/:id/addons", tourController.getTourAddons);

// Route for getting tour vehicles
router.get("/:id/vehicles", tourController.getTourVehicles);

// --- Routes Admin (nécessitent d'être connecté ET d'être admin) ---
router.post("/", protect, isAdmin, tourController.createTour);
router.put("/:id", protect, isAdmin, tourController.updateTour);
router.delete("/:id", protect, isAdmin, tourController.deleteTour);

module.exports = router;
