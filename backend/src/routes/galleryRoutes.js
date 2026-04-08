const express = require("express");
const galleryController = require("../controllers/galleryController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", galleryController.getImages);
router.get("/:id", galleryController.getImageById);

// Admin routes
router.post("/", protect, isAdmin, galleryController.uploadImage);
router.put("/:id", protect, isAdmin, galleryController.updateImage);
router.delete("/:id", protect, isAdmin, galleryController.deleteImage);

module.exports = router;
