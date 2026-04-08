// Central route configuration file
// Add this to your main server file (index.js or app.js)

const express = require("express");
const userRoutes = require("./userRoutes");
const tourRoutes = require("./tourRoutes");
const bookingRoutes = require("./bookingRoutes");
const quoteRevisionRoutes = require("./quoteRevisionRoutes");
const specialOffersRoutes = require("./specialOffersRoutes");
const specialOffersAnalyticsRoutes = require("./specialOffersAnalyticsRoutes");
const galleryRoutes = require("./galleryRoutes");
const notificationRoutes = require("./notificationRoutes");
const adminRoutes = require("./adminRoutes");
const reviewRoutes = require("./reviewRoutes");
const paymentRoutes = require("./paymentRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const emailLogsRoutes = require("./emailLogsRoutes");
const bookingReviewRoutes = require("./bookingReviewRoutes");
const myReviewsRoutes = require("./myReviewsRoutes");
const quoteViewRoutes = require("./quoteViewRoutes");
const blogRoutes = require("./blogRoutes");
const blogCategoryRoutes = require("./blogCategoryRoutes");
const adminBlogRoutes = require("./adminBlogRoutes");

const router = express.Router();

// API Routes
router.use("/users", userRoutes);
router.use("/tours", tourRoutes);
router.use("/bookings", bookingRoutes);
router.use("/bookings", quoteRevisionRoutes); // Quote revision routes (extends booking routes)
router.use("/bookings", paymentRoutes); // Payment routes (extends booking routes)
router.use("/my-bookings", quoteViewRoutes); // Quote view pages (customer-facing quote pages)
router.use("/", specialOffersRoutes); // Special offers routes (for quote review)
router.use("/", specialOffersAnalyticsRoutes); // Special offers analytics routes
router.use("/gallery", galleryRoutes);
router.use("/notifications", notificationRoutes); // NEW: Dedicated notification routes
router.use("/admin", adminRoutes);
router.use("/reviews", reviewRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/", emailLogsRoutes); // Email logs routes (includes both admin and user routes)
router.use("/booking-reviews", bookingReviewRoutes); // Booking review routes (for completed trips)
router.use("/my-reviews", myReviewsRoutes); // My reviews routes (all user reviews)
router.use("/blog", blogRoutes); // Blog routes (public blog posts)
router.use("/blog/categories", blogCategoryRoutes); // Blog category routes
router.use("/admin/blog", adminBlogRoutes); // Admin blog management routes

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API documentation endpoint
router.get("/docs", (req, res) => {
  res.status(200).json({
    message: "Ebenezer Tours API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      tours: "/api/tours",
      bookings: "/api/bookings",
      quoteRevisions: "/api/bookings/:bookingId/review",
      gallery: "/api/gallery",
      notifications: "/api/notifications",
      admin: "/api/admin",
      reviews: "/api/reviews",
      payments: "/api/payments",
      analytics: "/api/analytics",
      blog: "/api/blog",
      blogCategories: "/api/blog/categories",
      adminBlog: "/api/admin/blog",
    },
  });
});

module.exports = router;
