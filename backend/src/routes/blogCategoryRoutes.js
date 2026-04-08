const express = require("express");
const router = express.Router();
const blogCategoryController = require("../controllers/blogCategoryController");

// GET /api/blog/categories - Récupérer toutes les catégories
router.get("/", blogCategoryController.getAllCategories);

// GET /api/blog/categories/:slug - Récupérer une catégorie par slug
router.get("/:slug", blogCategoryController.getCategoryBySlug);

module.exports = router;
