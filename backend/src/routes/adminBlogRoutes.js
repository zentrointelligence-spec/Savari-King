const express = require("express");
const router = express.Router();
const adminBlogController = require("../controllers/adminBlogController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Toutes les routes admin nécessitent authentification et rôle admin
router.use(authenticateToken);
router.use(isAdmin);

// GET /api/admin/blog/stats - Statistiques globales
router.get("/stats", adminBlogController.getBlogStats);

// GET /api/admin/blog/comments/pending - Commentaires en attente
router.get("/comments/pending", adminBlogController.getPendingComments);

// PUT /api/admin/blog/comments/:id/approve - Approuver un commentaire
router.put("/comments/:id/approve", adminBlogController.approveComment);

// DELETE /api/admin/blog/comments/:id - Supprimer un commentaire
router.delete("/comments/:id", adminBlogController.deleteComment);

// GET /api/admin/blog - Liste tous les articles
router.get("/", adminBlogController.getAllPosts);

// POST /api/admin/blog - Créer un article
router.post("/", adminBlogController.createPost);

// GET /api/admin/blog/:id - Récupérer un article par ID
router.get("/:id", adminBlogController.getPostById);

// PUT /api/admin/blog/:id - Mettre à jour un article
router.put("/:id", adminBlogController.updatePost);

// DELETE /api/admin/blog/:id - Supprimer un article
router.delete("/:id", adminBlogController.deletePost);

module.exports = router;
