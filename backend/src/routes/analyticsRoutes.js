const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Route principale pour récupérer toutes les données d'analyse
router.get("/", protect, isAdmin, analyticsController.getAnalyticsData);

module.exports = router;
