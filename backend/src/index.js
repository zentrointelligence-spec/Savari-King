const express = require("express");
const cors = require("cors");
const config = require("./config/config");

// Import all the route handlers we will create
const userRoutes = require("./routes/userRoutes");
const tourRoutes = require("./routes/tourRoutes");
const bookingRoutes = require("./routes/bookingRoutesNew");
const quoteRevisionRoutes = require("./routes/quoteRevisionRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const homepageRoutes = require("./routes/homepageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const emailLogsRoutes = require("./routes/emailLogsRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const addonReviewRoutes = require("./routes/addonReviewRoutes");
const bookingReviewRoutes = require("./routes/bookingReviewRoutes");
const myReviewsRoutes = require("./routes/myReviewsRoutes");
const quoteViewRoutes = require("./routes/quoteViewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminNotificationRoutes = require("./routes/adminNotificationRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");
const currencyRoutes = require("./routes/currencyRoutes");

// Import currency update job
const { startCurrencyUpdateJob } = require("./jobs/currencyUpdateJob");

// Import quote expiration job
const { startQuoteExpirationJob } = require("./jobs/quoteExpirationJob");

// Import destinations refresh job
const { initializeDestinationsJob, initializeNotificationListener } = require("./jobs/refreshDestinationsJob");

// Import quote expiration notification job
const quoteExpirationNotificationJob = require("./jobs/quoteExpirationNotificationJob");
const db = require("./db");
const { runMigrations } = require("../run_all_migrations");

// 2. INITIALIZE THE EXPRESS APPLICATION
const app = express();

// Utiliser la configuration centralisée
const PORT = config.server.port;

app.use(cors(config.cors));

// 3. CONFIGURE MIDDLEWARE
// Enable Cross-Origin Resource Sharing (CORS)
// This is crucial to allow our frontend (on a different port) to communicate with this backend.
// app.use(cors(config.cors));

// Enable the express.json() middleware
// This allows our server to understand and parse incoming request bodies in JSON format.
app.use(express.json());

// Serve static files from the uploads directory
app.use("/uploads", express.static("uploads"));

// Serve static files from the public directory (quotes, etc.)
app.use("/quotes", express.static("public/quotes"));

// Serve payment receipt PDFs
app.use("/payment-receipts", express.static("public/payment-receipts"));

// 4. DEFINE API ROUTES
// A simple test route to check if the server is running
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Ebenezer Tours and Travels API!",
    version: "1.0.0",
    environment: config.server.env,
    status: "running",
  });
});

// All routes related to users will be handled by userRoutes
app.use("/api/users", userRoutes);

// All routes related to tours will be handled by tourRoutes
app.use("/api/tours", tourRoutes);

// All routes related to bookings will be handled by bookingRoutes
app.use("/api/bookings", bookingRoutes);

// All routes related to quote revisions will be handled by quoteRevisionRoutes (extends booking routes)
app.use("/api/bookings", quoteRevisionRoutes);

// All routes related to destinations will be handled by destinationRoutes
app.use("/api/destinations", destinationRoutes);

// We are there!!!
app.use("/api/homepage", homepageRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/gallery", galleryRoutes);

app.use("/api/blog", blogRoutes);

// All routes related to notifications will be handled by notificationRoutes
app.use("/api/notifications", notificationRoutes);

// All routes related to payments will be handled by paymentRoutes
app.use("/api/bookings", paymentRoutes);

// All routes related to email logs will be handled by emailLogsRoutes
app.use("/api", emailLogsRoutes);

// All routes related to reviews will be handled by reviewRoutes
app.use("/api/reviews", reviewRoutes);

// All routes related to addon reviews will be handled by addonReviewRoutes
app.use("/api/addon-reviews", addonReviewRoutes);

// All routes related to booking reviews will be handled by bookingReviewRoutes
app.use("/api/booking-reviews", bookingReviewRoutes);

// All routes related to user's own reviews will be handled by myReviewsRoutes
app.use("/api/my-reviews", myReviewsRoutes);

// All routes related to quote viewing and acceptance will be handled by quoteViewRoutes
app.use("/api/my-bookings", quoteViewRoutes);

// All routes for the admin dashboard will be handled by adminRoutes
app.use("/api/admin", adminRoutes);

// All routes related to admin notifications will be handled by adminNotificationRoutes
app.use("/api/admin/notifications", adminNotificationRoutes);

// All routes related to email templates will be handled by emailTemplateRoutes
app.use("/api/admin/email-templates", emailTemplateRoutes);

// All routes related to currencies will be handled by currencyRoutes
app.use("/api/currencies", currencyRoutes);

app.get("/api/health/db", async (req, res) => {
  try {
    const r = await db.query("SELECT 1 AS ok");
    const ok = r.rows && r.rows[0] && (r.rows[0].ok === 1 || r.rows[0].ok === "1");
    res.json({ connected: !!ok });
  } catch (e) {
    res.status(500).json({ connected: false, error: e.message });
  }
});

// 5. START THE SERVER
// Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      if (process.env.MIGRATE_ON_STARTUP === 'true') {
        const durl = process.env.DATABASE_URL;
        let target = '';
        if (durl) {
          try {
            const u = new URL(durl);
            const dbname = u.pathname ? u.pathname.replace('/', '') : '';
            const sslmode = u.searchParams.get('sslmode') || '';
            target = `user=${u.username} host=${u.hostname} port=${u.port} db=${dbname} sslmode=${sslmode}`;
          } catch {
            target = 'database_url_detected';
          }
        } else {
          target = `user=${config.database.user} host=${config.database.host} port=${config.database.port} db=${config.database.database}`;
        }
        console.log('🔧 MIGRATE_ON_STARTUP=true');
        console.log(`🗄️ Migration target: ${target}`);
        await runMigrations();
        console.log('✅ Startup migrations completed');
      }
    } catch (e) {
      console.error("Migrations failed", e);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${config.server.env}`);
      console.log(
        `🗄️  Database: ${config.database.database}@${config.database.host}:${config.database.port}`
      );
      console.log(`🌐 CORS origin: ${config.cors.origin}`);

      (async () => {
        try {
          startCurrencyUpdateJob();
          const quoteTable = await db.query(
            "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1) AS exists",
            ["booking_quote_revisions"]
          );
          if (quoteTable.rows[0].exists) {
            startQuoteExpirationJob();
            quoteExpirationNotificationJob.start();
          } else {
            console.warn("Skipping quote jobs: booking_quote_revisions table missing");
          }
          const destinationsTable = await db.query(
            "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1) AS exists",
            ["destinations"]
          );
          const refreshFn = await db.query(
            "SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname=$1) AS exists",
            ["refresh_popular_destinations"]
          );
          if (destinationsTable.rows[0].exists && refreshFn.rows[0].exists) {
            initializeDestinationsJob();
            initializeNotificationListener();
          } else {
            console.warn("Skipping destinations jobs: required table/function missing");
          }
        } catch (e) {
          console.error("Error initializing jobs", e);
        }
      })();
    });
  })();
}

// Export the app for testing
module.exports = app;
