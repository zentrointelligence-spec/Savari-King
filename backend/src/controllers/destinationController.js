// ======================================================================
// FILE: `backend/src/controllers/destinationController.js`
// Role: HTTP request handlers for the "Destinations" resource.
// All business logic delegated to destinationService.
// ======================================================================

const destinationService = require("../services/destinationService");
const { logUserActivity } = require("../services/activityService");
const db = require("../db");

/**
 * @description Get popular destinations
 * @route GET /api/destinations/popular
 * @access Public
 */
exports.getPopularDestinations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const criteria = req.query.criteria || "popularity";

    const destinations = await destinationService.getTopDestinations(
      limit,
      criteria
    );

    res.status(200).json({
      status: 200,
      data: destinations,
      count: destinations.length,
    });
  } catch (error) {
    console.error("Error fetching popular destinations:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
      message: "Could not fetch popular destinations",
    });
  }
};

/**
 * @description Get top destinations (legacy endpoint, kept for backwards compatibility)
 * @route GET /api/destinations/top
 * @access Public
 */
exports.getTopDestinations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const destinations = await destinationService.getTopDestinations(limit);

    res.status(200).json(destinations);
  } catch (error) {
    console.error("Error fetching top destinations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Get featured destinations
 * @route GET /api/destinations/featured
 * @access Public
 */
exports.getFeaturedDestinations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const destinations = await destinationService.getTopDestinations(
      limit,
      "featured"
    );

    res.status(200).json({
      status: 200,
      data: destinations,
      count: destinations.length,
    });
  } catch (error) {
    console.error("Error fetching featured destinations:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Get trending destinations
 * @route GET /api/destinations/trending
 * @access Public
 */
exports.getTrendingDestinations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const destinations = await destinationService.getTopDestinations(
      limit,
      "trending"
    );

    res.status(200).json({
      status: 200,
      data: destinations,
      count: destinations.length,
    });
  } catch (error) {
    console.error("Error fetching trending destinations:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Get all destinations with filters
 * @route GET /api/destinations
 * @access Public
 */
exports.getAllDestinations = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      regions: req.query.regions ? req.query.regions.split(",") : undefined,
      budgetCategories: req.query.budgetCategories
        ? req.query.budgetCategories.split(",")
        : undefined,
      adventureLevels: req.query.adventureLevels
        ? req.query.adventureLevels.split(",")
        : undefined,
      flags: req.query.flags ? req.query.flags.split(",") : undefined,
      minRating: req.query.minRating ? parseFloat(req.query.minRating) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      activities: req.query.activities
        ? req.query.activities.split(",")
        : undefined,
    };

    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      orderBy: req.query.orderBy || "popularity_score DESC",
    };

    const destinations = await destinationService.getEnrichedDestinations(
      filters,
      options
    );

    res.status(200).json({
      status: 200,
      data: destinations,
      count: destinations.length,
      filters: filters,
      pagination: {
        limit: options.limit,
        offset: options.offset,
      },
    });
  } catch (error) {
    console.error("Error fetching all destinations:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Advanced search for destinations
 * @route POST /api/destinations/search
 * @access Public
 */
exports.searchDestinations = async (req, res) => {
  try {
    const filters = {
      search: req.body.query,
      regions: req.body.regions,
      budgetCategories: req.body.budgetCategories,
      adventureLevels: req.body.adventureLevels,
      flags: req.body.flags,
      minRating: req.body.minRating,
      maxPrice: req.body.maxPrice,
      activities: req.body.activities,
    };

    const options = {
      limit: parseInt(req.body.limit) || 50,
      offset: parseInt(req.body.offset) || 0,
      orderBy: req.body.orderBy || "popularity_score DESC",
    };

    const destinations = await destinationService.getEnrichedDestinations(
      filters,
      options
    );

    res.status(200).json({
      status: 200,
      data: destinations,
      count: destinations.length,
      searchQuery: req.body.query,
    });
  } catch (error) {
    console.error("Error in advanced search:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Get destination by ID with detailed information
 * @route GET /api/destinations/:id
 * @access Public
 */
exports.getDestinationById = async (req, res) => {
  const { id } = req.params;

  try {
    const destination = await destinationService.getDestinationById(id);

    if (!destination) {
      return res.status(404).json({
        status: 404,
        error: "Destination not found",
      });
    }

    // Increment view count
    await db.query(
      "UPDATE destinations SET view_count = view_count + 1 WHERE id = $1",
      [id]
    );

    res.status(200).json({
      status: 200,
      data: destination,
    });
  } catch (error) {
    console.error("Error fetching destination by ID:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Get destination by slug with detailed information
 * @route GET /api/destinations/slug/:slug
 * @access Public
 */
exports.getDestinationBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await db.query(
      `SELECT
        d.*,
        (
          (d.tour_count * 0.25) +
          (d.avg_rating * 5 * 0.20) +
          (d.total_bookings * 0.30) +
          (d.wishlist_count * 0.10) +
          (CASE WHEN d.is_featured THEN 10 ELSE 0 END) +
          (CASE WHEN d.is_trending THEN 5 ELSE 0 END)
        ) as popularity_score
      FROM destinations d
      WHERE d.slug = $1 AND d.is_active = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        error: "Destination not found",
      });
    }

    const destination = destinationService.formatDestinationResponse(result.rows[0]);

    // Increment view count
    await db.query(
      "UPDATE destinations SET view_count = view_count + 1 WHERE slug = $1",
      [slug]
    );

    res.status(200).json({
      status: 200,
      data: destination,
    });
  } catch (error) {
    console.error("Error fetching destination by slug:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Get related destinations
 * @route GET /api/destinations/:id/related
 * @access Public
 */
exports.getRelatedDestinations = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 4;

  try {
    const destinations = await destinationService.getRelatedDestinations(
      id,
      limit
    );

    res.status(200).json({
      status: 200,
      data: destinations,
      count: destinations.length,
    });
  } catch (error) {
    console.error("Error fetching related destinations:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Get nearby destinations
 * @route GET /api/destinations/:id/nearby
 * @access Public
 */
exports.getNearbyDestinations = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 4;
  const radius = parseInt(req.query.radius) || 500; // km

  try {
    const destinations = await destinationService.getNearbyDestinations(
      id,
      radius,
      limit
    );

    res.status(200).json({
      status: 200,
      data: destinations,
      count: destinations.length,
      radius: radius,
    });
  } catch (error) {
    console.error("Error fetching nearby destinations:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Get destination statistics
 * @route GET /api/destinations/:id/stats
 * @access Public
 */
exports.getDestinationStats = async (req, res) => {
  const { id } = req.params;

  try {
    const stats = await destinationService.getDestinationStats(id);

    if (!stats) {
      return res.status(404).json({
        status: 404,
        error: "Destination not found",
      });
    }

    res.status(200).json({
      status: 200,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching destination stats:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Toggle like/unlike for a destination
 * @route POST /api/destinations/:id/like
 * @access Protected (requires authentication)
 */
exports.toggleDestinationLike = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if destination exists
    const destinationCheck = await db.query(
      "SELECT id FROM destinations WHERE id = $1 AND is_active = true",
      [id]
    );

    if (destinationCheck.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        error: "Destination not found",
      });
    }

    // Check if user already liked this destination
    const existingLike = await db.query(
      "SELECT id FROM destination_likes WHERE user_id = $1 AND destination_id = $2",
      [userId, id]
    );

    let liked = false;

    if (existingLike.rows.length > 0) {
      // Unlike: Remove the like
      await db.query(
        "DELETE FROM destination_likes WHERE user_id = $1 AND destination_id = $2",
        [userId, id]
      );
      liked = false;

      // Decrement wishlist count
      await db.query(
        "UPDATE destinations SET wishlist_count = GREATEST(wishlist_count - 1, 0) WHERE id = $1",
        [id]
      );
    } else {
      // Like: Add the like
      await db.query(
        "INSERT INTO destination_likes (user_id, destination_id) VALUES ($1, $2)",
        [userId, id]
      );
      liked = true;

      // Increment wishlist count
      await db.query(
        "UPDATE destinations SET wishlist_count = wishlist_count + 1 WHERE id = $1",
        [id]
      );
    }

    // Log user activity
    await logUserActivity(
      userId,
      liked ? "Liked Destination" : "Unliked Destination",
      {
        destinationId: id,
      }
    );

    // Get updated like count
    const likeCountResult = await db.query(
      "SELECT COUNT(*) as total_likes FROM destination_likes WHERE destination_id = $1",
      [id]
    );

    res.status(200).json({
      status: 200,
      data: {
        liked,
        totalLikes: parseInt(likeCountResult.rows[0].total_likes),
      },
    });
  } catch (error) {
    console.error("Error toggling destination like:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Get destinations liked by the current user
 * @route GET /api/destinations/liked
 * @access Protected (requires authentication)
 */
exports.getUserLikedDestinations = async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT
        d.*,
        dl.created_at as liked_at,
        (
          (d.tour_count * 0.25) +
          (d.avg_rating * 5 * 0.20) +
          (d.total_bookings * 0.30) +
          (d.wishlist_count * 0.10) +
          (CASE WHEN d.is_featured THEN 10 ELSE 0 END) +
          (CASE WHEN d.is_trending THEN 5 ELSE 0 END)
        ) as popularity_score
      FROM destinations d
      INNER JOIN destination_likes dl ON d.id = dl.destination_id
      WHERE dl.user_id = $1 AND d.is_active = true
      ORDER BY dl.created_at DESC
    `;

    const result = await db.query(query, [userId]);

    const destinations = result.rows.map((dest) => ({
      ...destinationService.formatDestinationResponse(dest),
      likedAt: dest.liked_at,
    }));

    res.status(200).json({
      status: 200,
      data: destinations,
      count: destinations.length,
    });
  } catch (error) {
    console.error("Error fetching user liked destinations:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

/**
 * @description Sync local likes when user logs in
 * @route POST /api/destinations/sync-likes
 * @access Protected (requires authentication)
 */
exports.syncLocalLikes = async (req, res) => {
  const userId = req.user.id;
  const { localLikes } = req.body; // Array of destination IDs

  if (!localLikes || !Array.isArray(localLikes)) {
    return res.status(400).json({
      status: 400,
      error: "Invalid request",
      message: "localLikes must be an array",
    });
  }

  try {
    let syncedCount = 0;

    for (const destId of localLikes) {
      // Check if destination exists
      const destCheck = await db.query(
        "SELECT id FROM destinations WHERE id = $1 AND is_active = true",
        [destId]
      );

      if (destCheck.rows.length === 0) {
        continue;
      }

      // Insert like if not exists
      const insertResult = await db.query(
        `INSERT INTO destination_likes (user_id, destination_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, destination_id) DO NOTHING
         RETURNING id`,
        [userId, destId]
      );

      if (insertResult.rows.length > 0) {
        syncedCount++;
        // Increment wishlist count
        await db.query(
          "UPDATE destinations SET wishlist_count = wishlist_count + 1 WHERE id = $1",
          [destId]
        );
      }
    }

    // Get all user's liked destinations
    const likedDests = await db.query(
      "SELECT destination_id FROM destination_likes WHERE user_id = $1",
      [userId]
    );

    res.status(200).json({
      status: 200,
      message: `Synced ${syncedCount} likes`,
      data: {
        syncedCount,
        totalLikes: likedDests.rows.length,
        likedDestinations: likedDests.rows.map((row) => row.destination_id),
      },
    });
  } catch (error) {
    console.error("Error syncing local likes:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};
