const express = require("express");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// POST /api/users/register
router.post("/register", userController.register);

// GET /api/users/verify-email?token=...
router.get("/verify-email", userController.verifyEmail);

// POST /api/users/login
router.post("/login", userController.login);

// --- Password Reset Routes ---
router.post("/request-password-reset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);

router.get("/profile", protect, userController.getUserProfile);
router.put("/profile", protect, userController.updateUserProfile);
router.post("/change-password", protect, userController.changePassword);

router.get("/notifications", protect, userController.getUserNotifications);
router.patch(
  "/notifications/:notificationId/read",
  protect,
  userController.markNotificationAsRead
);

// Routes pour les favoris
router.post("/favorites/:tourId", protect, userController.addToFavorites);
router.delete("/favorites/:tourId", protect, userController.removeFromFavorites);
router.get("/favorites", protect, userController.getUserFavorites);
router.get("/favorites/:tourId/check", protect, userController.checkFavorite);

// Routes pour la wishlist
router.post("/wishlist/:tourId", protect, userController.addToWishlist);
router.delete("/wishlist/:tourId", protect, userController.removeFromWishlist);
router.get("/wishlist", protect, userController.getUserWishlist);
router.get("/wishlist/:tourId/check", protect, userController.checkWishlist);
router.put("/wishlist/:tourId", protect, userController.updateWishlistItem);

// Route pour l'activité utilisateur
router.get("/activity", protect, userController.getUserActivity);

// Routes pour les préférences utilisateur
router.get("/preferences", protect, userController.getUserPreferences);
router.put("/preferences", protect, userController.updateUserPreferences);

module.exports = router;
