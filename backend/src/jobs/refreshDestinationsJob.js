// ======================================================================
// FILE: `backend/src/jobs/refreshDestinationsJob.js`
// Purpose: Scheduled job to refresh destinations materialized view
// ======================================================================

const db = require("../db");
const cron = require("node-cron");

/**
 * Refresh the destinations materialized view
 * This updates pre-calculated popularity scores and seasonal data
 */
async function refreshDestinationsMaterializedView() {
  try {
    console.log("[Destinations Job] Starting materialized view refresh...");
    const startTime = Date.now();

    await db.query("SELECT refresh_popular_destinations()");

    const duration = Date.now() - startTime;
    console.log(
      `[Destinations Job] Materialized view refreshed successfully in ${duration}ms`
    );

    // TODO: Log the refresh to a table if system_logs table exists
    // await db.query(
    //   `INSERT INTO system_logs (log_type, message, metadata, created_at)
    //    VALUES ($1, $2, $3, NOW())
    //    ON CONFLICT DO NOTHING`,
    //   [
    //     "materialized_view_refresh",
    //     "Destinations materialized view refreshed",
    //     JSON.stringify({ duration_ms: duration }),
    //   ]
    // );

    return { success: true, duration };
  } catch (error) {
    console.error(
      "[Destinations Job] Error refreshing materialized view:",
      error
    );

    // TODO: Log the error to system_logs if table exists
    // try {
    //   await db.query(
    //     `INSERT INTO system_logs (log_type, message, metadata, level, created_at)
    //      VALUES ($1, $2, $3, $4, NOW())`,
    //     [
    //       "materialized_view_refresh_error",
    //       "Failed to refresh destinations materialized view",
    //       JSON.stringify({ error: error.message }),
    //       "error",
    //     ]
    //   );
    // } catch (logError) {
    //   console.error("[Destinations Job] Error logging failure:", logError);
    // }

    return { success: false, error: error.message };
  }
}

/**
 * Update destination statistics
 * Recalculate tour counts, ratings, bookings, etc.
 */
async function updateDestinationStatistics() {
  try {
    console.log("[Destinations Job] Updating destination statistics...");
    const startTime = Date.now();

    // Update tour counts
    await db.query(`
      UPDATE destinations d
      SET tour_count = (
        SELECT COUNT(DISTINCT t.id)
        FROM tour_destinations td
        JOIN tours t ON td.tour_id = t.id
        WHERE td.destination_id = d.id AND t.is_active = true
      )
      WHERE d.is_active = true
    `);

    // Update average ratings
    await db.query(`
      UPDATE destinations d
      SET avg_rating = COALESCE((
        SELECT AVG(t.rating)
        FROM tour_destinations td
        JOIN tours t ON td.tour_id = t.id
        WHERE td.destination_id = d.id AND t.is_active = true
      ), 0)
      WHERE d.is_active = true
    `);

    // Update review counts
    await db.query(`
      UPDATE destinations d
      SET review_count = COALESCE((
        SELECT COUNT(r.id)
        FROM tour_destinations td
        JOIN tours t ON td.tour_id = t.id
        JOIN reviews r ON t.id = r.tour_id
        WHERE td.destination_id = d.id AND t.is_active = true
      ), 0)
      WHERE d.is_active = true
    `);

    // Update total bookings
    await db.query(`
      UPDATE destinations d
      SET total_bookings = COALESCE((
        SELECT COUNT(b.id)
        FROM tour_destinations td
        JOIN tours t ON td.tour_id = t.id
        JOIN bookings b ON t.id = b.tour_id
        WHERE td.destination_id = d.id
          AND t.is_active = true
          AND b.status NOT IN ('cancelled', 'failed')
      ), 0)
      WHERE d.is_active = true
    `);

    const duration = Date.now() - startTime;
    console.log(
      `[Destinations Job] Statistics updated successfully in ${duration}ms`
    );

    return { success: true, duration };
  } catch (error) {
    console.error(
      "[Destinations Job] Error updating destination statistics:",
      error
    );
    return { success: false, error: error.message };
  }
}

/**
 * Mark trending destinations based on recent activity
 * A destination is trending if it has significant activity in the last 30 days
 */
async function updateTrendingDestinations() {
  try {
    console.log("[Destinations Job] Updating trending destinations...");

    // Reset all trending flags
    await db.query(`
      UPDATE destinations
      SET is_trending = false
      WHERE is_trending = true
    `);

    // Mark destinations as trending based on recent bookings and views
    await db.query(`
      UPDATE destinations d
      SET is_trending = true
      WHERE d.is_active = true
        AND d.id IN (
          SELECT td.destination_id
          FROM tour_destinations td
          JOIN tours t ON td.tour_id = t.id
          JOIN bookings b ON t.id = b.tour_id
          WHERE b.created_at >= CURRENT_DATE - INTERVAL '30 days'
            AND b.status NOT IN ('cancelled', 'failed')
          GROUP BY td.destination_id
          HAVING COUNT(b.id) >= 5
          ORDER BY COUNT(b.id) DESC
          LIMIT 10
        )
    `);

    console.log("[Destinations Job] Trending destinations updated");
    return { success: true };
  } catch (error) {
    console.error(
      "[Destinations Job] Error updating trending destinations:",
      error
    );
    return { success: false, error: error.message };
  }
}

/**
 * Main job function - runs all destination updates
 */
async function runDestinationsMaintenanceJob() {
  console.log("\n========================================");
  console.log("[Destinations Job] Starting maintenance job");
  console.log("========================================\n");

  const results = {
    timestamp: new Date().toISOString(),
    tasks: {},
  };

  // 1. Update statistics
  results.tasks.statistics = await updateDestinationStatistics();

  // 2. Update trending flags
  results.tasks.trending = await updateTrendingDestinations();

  // 3. Refresh materialized view
  results.tasks.materializedView = await refreshDestinationsMaterializedView();

  console.log("\n========================================");
  console.log("[Destinations Job] Maintenance job completed");
  console.log("Results:", JSON.stringify(results, null, 2));
  console.log("========================================\n");

  return results;
}

/**
 * Initialize the scheduled job
 * Runs every hour at minute 0
 */
function initializeDestinationsJob() {
  console.log("[Destinations Job] Initializing scheduled job...");

  // Run every hour
  const job = cron.schedule(
    "0 * * * *", // Every hour at minute 0
    async () => {
      await runDestinationsMaintenanceJob();
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata", // Adjust to your timezone
    }
  );

  console.log("[Destinations Job] Scheduled to run every hour");

  // Also run immediately on startup (optional - comment out if not needed)
  // setTimeout(() => {
  //   runDestinationsMaintenanceJob();
  // }, 5000); // Run 5 seconds after startup

  return job;
}

/**
 * Listen for PostgreSQL notifications to trigger immediate refresh
 */
async function initializeNotificationListener() {
  try {
    const client = await db.pool.connect();

    await client.query("LISTEN refresh_destinations_mv");

    client.on("notification", async (msg) => {
      if (msg.channel === "refresh_destinations_mv") {
        console.log(
          "[Destinations Job] Received refresh notification:",
          msg.payload
        );

        // Simple debounce with in-memory timestamp (no DB dependency)
        const now = Date.now();
        if (!global.lastDestinationRefresh || (now - global.lastDestinationRefresh) >= 5 * 60 * 1000) {
          console.log("[Destinations Job] Triggering immediate refresh");
          global.lastDestinationRefresh = now;
          await refreshDestinationsMaterializedView();
        } else {
          const diffMinutes = (now - global.lastDestinationRefresh) / (1000 * 60);
          console.log(
            "[Destinations Job] Skipping refresh (last refresh was only " +
              diffMinutes.toFixed(1) +
              " minutes ago)"
          );
        }
      }
    });

    console.log(
      "[Destinations Job] Notification listener initialized successfully"
    );
  } catch (error) {
    console.error(
      "[Destinations Job] Error initializing notification listener:",
      error
    );
  }
}

// Export functions
module.exports = {
  initializeDestinationsJob,
  initializeNotificationListener,
  runDestinationsMaintenanceJob,
  refreshDestinationsMaterializedView,
  updateDestinationStatistics,
  updateTrendingDestinations,
};
