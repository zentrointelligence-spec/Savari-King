const express = require("express");
const blogController = require("../controllers/blogController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Routes publiques
// Route pour récupérer tous les articles
router.get("/", blogController.getAllPublishedPosts);

// Route pour récupérer les articles récents pour la page d'accueil
router.get("/recent", blogController.getRecentPosts);

// Routes nécessitant authentification
// POST /api/blog/:id/like - Toggle like
router.post("/:id/like", protect, blogController.toggleLike);

// GET /api/blog/:id/like-status - Vérifier si l'utilisateur a liké
router.get("/:id/like-status", protect, blogController.getLikeStatus);

// POST /api/blog/:id/rate - Noter un article (1-5 étoiles)
router.post("/:id/rate", protect, blogController.rateBlogPost);

// GET /api/blog/:id/rating - Récupérer la note de l'utilisateur
router.get("/:id/rating", protect, blogController.getUserRating);

// GET /api/blog/:id/comments - Récupérer les commentaires d'un article
router.get("/:id/comments", blogController.getComments);

// POST /api/blog/:id/comments - Ajouter un commentaire
router.post("/:id/comments", protect, blogController.addComment);

// Route pour récupérer un article spécifique (doit être en dernier pour éviter les conflits)
router.get("/:slug", blogController.getPostBySlug);

module.exports = router;
