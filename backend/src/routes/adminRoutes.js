const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// --- Routes de Vue d'Ensemble ---
// Récupère les statistiques pour la page d'accueil du tableau de bord.
router.get("/stats", protect, isAdmin, adminController.getDashboardStats);
router.get(
  "/layout-stats",
  protect,
  isAdmin,
  adminController.getLayoutStats
);

// Gérer les Tours
router.post("/tours", protect, isAdmin, adminController.createTour);
router.put("/tours/:tourId", protect, isAdmin, adminController.updateTour);
router.delete("/tours/:tourId", protect, isAdmin, adminController.deleteTour);
router.get("/tours", protect, isAdmin, adminController.getAllToursAdmin);
router.get(
  "/tours/:tourId/details",
  protect,
  isAdmin,
  adminController.getTourDetails
);

// Everything concerning package-tiers
router.post(
  "/package-tiers",
  protect,
  isAdmin,
  adminController.createPackageTier
);

// Récupère la liste de toutes les réservations pour l'admin.
router.get("/bookings", protect, isAdmin, adminController.getAllBookings);

// Send quote to customer
router.post("/bookings/:bookingId/send-quote", protect, isAdmin, adminController.sendQuoteToCustomer);

// Everything concerning Users
router.get("/users/pending-count", protect, isAdmin, adminController.getPendingUsersCount);
router.post("/users", protect, isAdmin, adminController.createUser);
router.get("/users", protect, isAdmin, adminController.getAllUsers);
router.get(
  "/password-resets",
  protect,
  isAdmin,
  adminController.getPendingResets
);
router.post(
  "/password-resets/:resetId/approve",
  protect,
  isAdmin,
  adminController.approveResetRequest
);
router.put("/users/:userId", protect, isAdmin, adminController.updateUser);
router.post(
  "/users/:userId/send-email",
  protect,
  isAdmin,
  adminController.sendAdminEmail
);
router.delete("/users/:userId", protect, isAdmin, adminController.deleteUser);
router.get("/user-stats", protect, isAdmin, adminController.getUserStats);
router.patch(
  "/users/:userId/status",
  protect,
  isAdmin,
  adminController.toggleUserStatus
);
router.post(
  "/password-resets/:resetId/reject",
  protect,
  isAdmin,
  adminController.rejectResetRequest
);
router.get(
  "/security-stats",
  protect,
  isAdmin,
  adminController.getSecurityStats
);
router.get("/security-logs", protect, isAdmin, adminController.getSecurityLogs);

// --- Gérer les Véhicules (CRUD Complet) ---
router.get("/vehicles", protect, isAdmin, adminController.getAllVehicles);
router.post("/vehicles", protect, isAdmin, adminController.createVehicle);
router.put("/vehicles/:id", protect, isAdmin, adminController.updateVehicle);
router.delete("/vehicles/:id", protect, isAdmin, adminController.deleteVehicle);

// --- Gérer les Add-Ons (CRUD Complet) ---
router.get("/addons", protect, isAdmin, adminController.getAllAddons);
router.post("/addons", protect, isAdmin, adminController.createAddon);
router.put("/addons/:id", protect, isAdmin, adminController.updateAddon);
router.delete("/addons/:id", protect, isAdmin, adminController.deleteAddon);
router.post("/tours/addons", protect, isAdmin, adminController.linkAddonToTour);
router.delete(
  "/tours/addons",
  protect,
  isAdmin,
  adminController.unlinkAddonFromTour
);

// Everything for reviews
router.get("/reviews", protect, isAdmin, adminController.getAllReviews);
router.patch(
  "/reviews/:reviewId/approve",
  protect,
  isAdmin,
  adminController.approveReview
);
router.delete(
  "/reviews/:reviewId",
  protect,
  isAdmin,
  adminController.deleteReview
);
router.get("/review-stats", protect, isAdmin, adminController.getReviewStats);

// For dashboard
router.get("/dashboard", protect, isAdmin, adminController.getDashboardData);

router.patch(
  "/tours/:tourId/status",
  protect,
  isAdmin,
  adminController.toggleTourStatus
);

// --- Gérer les Catégories de Tours (CRUD Complet) ---
router.get("/tour-categories", protect, isAdmin, adminController.getAllTourCategories);
router.post("/tour-categories", protect, isAdmin, adminController.createTourCategory);
router.put("/tour-categories/:id", protect, isAdmin, adminController.updateTourCategory);
router.delete("/tour-categories/:id", protect, isAdmin, adminController.deleteTourCategory);
router.patch("/tour-categories/:id/status", protect, isAdmin, adminController.toggleTourCategoryStatus);

// --- Routes d'Analytics (Étape 3.4) ---
router.get("/analytics/tours", protect, isAdmin, adminController.getTourAnalytics);
router.get("/analytics/users", protect, isAdmin, adminController.getUserAnalytics);
router.get("/analytics/system-health", protect, isAdmin, adminController.getSystemHealth);
router.get("/analytics/revenue", protect, isAdmin, adminController.getRevenueAnalytics);

// --- Routes d'Audit (Étape 3.5) ---
router.get("/audit/logs", protect, isAdmin, adminController.getAuditLogs);
router.get("/audit/stats", protect, isAdmin, adminController.getAuditStats);

module.exports = router;
