const express = require("express");
const homepageController = require("../controllers/homepageController");
const router = express.Router();

router.get("/tour-categories", homepageController.getHomepageToursCategories);
router.get("/tour-bestSellers", homepageController.getBestSellers);
router.get("/popularDestinations", homepageController.getPopularDestinations);
router.get("/activeSpecialOffers", homepageController.getActiveSpecialOffers);
router.get("/travelGuide", homepageController.getTravelGuides);

module.exports = router;
