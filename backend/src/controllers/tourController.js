// ======================================================================
// Role: Contains all logic (public and admin) for the "Tours" resource.
// ======================================================================

const db = require("../db");
const { logAdminAction } = require("../services/auditLogService");
const { logUserActivity } = require("../services/activityService");

// --- Public Functions ---

/**
 * @description Get all active tours with their details
 * Fetches all active tours with enriched information
 * @route GET /api/tours
 * @access Public
 */
exports.getActiveTours = async (req, res) => {
  const { destination, category, minPrice, maxPrice, minRating } = req.query;

  let baseQuery = `
    SELECT 
      t.id,
      t.name,
      t.main_image_url,
      t.short_description,
      t.rating,
      t.review_count,
      t.original_price,
      t.discount_percentage,
      t.available_from,
      t.available_until,
      t.is_featured,
      t.is_bestseller,
      t.is_trending,
      t.avg_rating,
      t.booking_count,
      t.view_count,
      tc.name as category_name,
      tc.slug as category_slug,
      (t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) as final_price
    FROM tours t
    LEFT JOIN tour_categories tc ON t.category_id = tc.id
    WHERE t.is_active = true
  `;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (destination) {
    conditions.push(`$${paramIndex} = ANY(t.destinations)`);
    params.push(destination);
    paramIndex++;
  }

  if (category) {
    conditions.push(`tc.slug = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  if (minPrice) {
    conditions.push(
      `(t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) >= $${paramIndex}`
    );
    params.push(parseFloat(minPrice));
    paramIndex++;
  }

  if (maxPrice) {
    conditions.push(
      `(t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) <= $${paramIndex}`
    );
    params.push(parseFloat(maxPrice));
    paramIndex++;
  }

  if (minRating) {
    conditions.push(`t.avg_rating >= $${paramIndex}`);
    params.push(parseFloat(minRating));
    paramIndex++;
  }

  if (conditions.length > 0) {
    baseQuery += " AND " + conditions.join(" AND ");
  }

  baseQuery +=
    " ORDER BY t.is_featured DESC, t.booking_count DESC, t.avg_rating DESC";

  try {
    const result = await db.query(baseQuery, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Get tour categories with count of tours in each category.
 * Fetches all categories from tour_categories table with tour counts and metadata.
 * @route GET /api/tours/categories
 * @access Public
 */
exports.getTourCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        tc.id,
        tc.name,
        tc.slug,
        tc.description,
        tc.icon,
        tc.color_theme as color,
        tc.display_order,
        tc.is_featured,
        tc.is_popular,
        tc.active_tour_count as tour_count,
        tc.avg_rating,
        tc.min_price,
        tc.max_price
      FROM tour_categories tc
      WHERE tc.is_active = true
      ORDER BY tc.display_order ASC, tc.name ASC
    `;

    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching tour categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// In-memory cache to prevent duplicate view counts within a short time window
const viewCache = new Map();
const VIEW_COOLDOWN_MS = 10000; // 10 seconds cooldown per user/IP per tour (aggressive for dev mode)

/**
 * @description Get accommodations for a specific tour
 * Fetches all package tiers with accommodation details for a tour
 * @route GET /api/tours/:tourId/accommodations
 * @access Public
 */
exports.getTourAccommodations = async (req, res) => {
  const { tourId } = req.params;

  try {
    const accommodationsResult = await db.query(
      `SELECT
        id,
        tier_name,
        hotel_type,
        accommodation_name,
        accommodation_image_url,
        accommodation_description,
        accommodation_rating,
        accommodation_tags,
        price,
        inclusions_summary
       FROM packagetiers
       WHERE tour_id = $1 AND accommodation_name IS NOT NULL
       ORDER BY
         CASE tier_name
           WHEN 'Standard' THEN 1
           WHEN 'Premium' THEN 2
           WHEN 'Luxury' THEN 3
           ELSE 4
         END ASC`,
      [tourId]
    );

    if (accommodationsResult.rows.length === 0) {
      return res.status(404).json({
        message: "No accommodations found for this tour",
        accommodations: [],
      });
    }

    res.status(200).json({
      tourId: parseInt(tourId),
      accommodations: accommodationsResult.rows,
    });
  } catch (error) {
    console.error(`Error fetching accommodations for tour ${tourId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.logTourView = async (req, res) => {
  const { tourId } = req.params;
  const userId = req.user?.id;
  const userIP = req.ip || req.connection.remoteAddress;

  try {
    // Create a unique key for this view attempt
    const viewKey = userId
      ? `user_${userId}_tour_${tourId}`
      : `ip_${userIP}_tour_${tourId}`;

    // Check if this view was already logged recently
    const lastViewTime = viewCache.get(viewKey);
    const now = Date.now();

    if (lastViewTime && now - lastViewTime < VIEW_COOLDOWN_MS) {
      // View was logged recently, skip increment
      const timeSinceLastView = ((now - lastViewTime) / 1000).toFixed(1);
      console.log(
        `[VIEW BLOCKED] Tour ${tourId} - ${viewKey} - Last viewed ${timeSinceLastView}s ago`
      );
      return res.status(200).json({
        message: "View already counted recently",
        cooldown: true,
        timeSinceLastView: timeSinceLastView,
      });
    }

    // Log user activity for authenticated users
    if (userId) {
      await logUserActivity(userId, "Viewed Tour", { tourId });
    }

    // Update view count in tours table
    await db.query(
      "UPDATE tours SET view_count = view_count + 1 WHERE id = $1",
      [tourId]
    );

    // Update cache with current timestamp
    viewCache.set(viewKey, now);

    console.log(
      `[VIEW LOGGED] Tour ${tourId} - ${viewKey} - View count incremented`
    );

    // Clean up old entries periodically (keep cache size manageable)
    if (viewCache.size > 10000) {
      const cutoffTime = now - VIEW_COOLDOWN_MS;
      for (const [key, time] of viewCache.entries()) {
        if (time < cutoffTime) {
          viewCache.delete(key);
        }
      }
    }

    res.status(200).json({ message: "View logged successfully" });
  } catch (error) {
    console.error(`Error logging tour view for tour ${tourId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Get a single tour by its ID with all details
 * Fetches a single tour by its ID with complete information
 * @route GET /api/tours/:id
 * @access Public
 */
exports.getTourById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || null;

  try {
    // Get tour data with all fields
    const tourResult = await db.query(
      `SELECT
        t.*,
        tc.name as category_name,
        tc.slug as category_slug,
        tc.icon as category_icon,
        tc.color_theme as category_color,
        (t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) as final_price,
        (SELECT COUNT(*) FROM reviews WHERE tour_id = t.id) as total_reviews
       FROM tours t
       LEFT JOIN tour_categories tc ON t.category_id = tc.id
       WHERE t.id = $1`,
      [id]
    );

    if (tourResult.rows.length === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }

    // Get tour images
    const imagesResult = await db.query(
      "SELECT * FROM tour_images WHERE tour_id = $1 ORDER BY is_primary DESC, display_order ASC",
      [id]
    );

    // Get tour inclusions grouped by type
    const inclusionsResult = await db.query(
      `SELECT
        inclusion_type,
        title,
        description,
        icon,
        is_included
       FROM tour_inclusions
       WHERE tour_id = $1 AND is_included = true
       ORDER BY inclusion_type, id`,
      [id]
    );

    // Get tour exclusions
    const exclusionsResult = await db.query(
      "SELECT title, description FROM tour_exclusions WHERE tour_id = $1 ORDER BY id",
      [id]
    );

    // Get tour destinations - using simple query since destinations table might not have all fields
    let destinationsResult;
    try {
      destinationsResult = await db.query(
        `SELECT
          d.id,
          d.name,
          d.slug,
          d.description,
          d.state,
          d.country,
          d.latitude,
          d.longitude,
          td.display_order
         FROM destinations d
         JOIN tour_destinations td ON d.id = td.destination_id
         WHERE td.tour_id = $1
         ORDER BY td.display_order ASC`,
        [id]
      );
    } catch (error) {
      console.log(
        "Destinations table query failed, using fallback:",
        error.message
      );
      // Fallback: use the destinations array from tours table
      destinationsResult = { rows: [] };
    }

    // Get package tiers if available - using * to get all columns
    // Order by price to ensure Standard -> Premium -> Luxury progression
    const tiersResult = await db.query(
      `SELECT *
       FROM packagetiers
       WHERE tour_id = $1
       ORDER BY price ASC`,
      [id]
    );

    // Get tour statistics
    const statsResult = await db.query(
      `SELECT
        total_bookings,
        total_revenue,
        avg_rating,
        total_reviews,
        page_views,
        wishlist_count,
        is_trending,
        is_bestseller
       FROM tour_statistics
       WHERE tour_id = $1`,
      [id]
    );

    // Track the view
    if (userId) {
      try {
        await logUserActivity(userId, "Viewed Tour Details", { tourId: id });
      } catch (viewError) {
        console.warn(
          `Warning: Could not track detailed view for tour ${id}:`,
          viewError
        );
      }
    }

    // View count tracking is now handled separately by logTourView endpoint
    // This prevents duplicate increments when fetching tour details

    // Get tour addons
    const addonsResult = await db.query(
      `SELECT
        a.id,
        a.name,
        a.price,
        a.original_price,
        a.description,
        a.category,
        a.icon,
        a.duration,
        a.features,
        a.availability,
        a.rating,
        a.popularity,
        a.is_best_value,
        a.per_person,
        a.max_quantity,
        a.price_per_person
       FROM addons a
       INNER JOIN touraddons ta ON a.id = ta.addon_id
       WHERE ta.tour_id = $1 AND a.is_active = true
       ORDER BY a.display_order ASC`,
      [id]
    );

    // Combine all data
    const tour = tourResult.rows[0];
    const tourData = {
      ...tour,
      images: imagesResult.rows,
      // Use joined inclusions if available, otherwise use array from tours table
      inclusions:
        inclusionsResult.rows.length > 0
          ? inclusionsResult.rows
          : tour.inclusions || [],
      // Use joined exclusions if available, otherwise use array from tours table
      exclusions:
        exclusionsResult.rows.length > 0
          ? exclusionsResult.rows
          : tour.exclusions || [],
      // Use joined destinations if available, otherwise use arrays from tours table
      destinations:
        destinationsResult.rows.length > 0
          ? destinationsResult.rows
          : tour.covered_destinations || tour.destinations || [],
      tiers: tiersResult.rows,
      statistics: statsResult.rows[0] || null,
      addons: addonsResult.rows,
    };

    res.status(200).json(tourData);
  } catch (error) {
    console.error(`Error fetching tour ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Admin-Only Functions ---

/**
 * @description Create a new Tour.
 * @route POST /api/tours
 * @access Private/Admin
 */
exports.createTour = async (req, res) => {
  const {
    name,
    main_image_url,
    itinerary,
    is_active,
    category_id,
    short_description,
    highlights,
    inclusions,
    exclusions,
    original_price,
    available_from,
    available_until,
  } = req.body;

  try {
    const newTour = await db.query(
      `INSERT INTO tours 
        (name, main_image_url, itinerary, is_active, category_id, short_description,
         highlights, inclusions, exclusions, original_price, available_from, available_until) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [
        name,
        main_image_url,
        JSON.stringify(itinerary),
        is_active,
        category_id,
        short_description,
        highlights,
        inclusions,
        exclusions,
        original_price,
        available_from,
        available_until,
      ]
    );

    const createdTour = newTour.rows[0];
    await logAdminAction(req.user.id, "CREATE", "Tour", createdTour.id, {
      name: createdTour.name,
    });

    res.status(201).json(createdTour);
  } catch (error) {
    console.error("Error creating tour:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Update an existing Tour.
 * @route PUT /api/tours/:id
 * @access Private/Admin
 */
exports.updateTour = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    main_image_url,
    is_active,
    itinerary,
    category_id,
    short_description,
    highlights,
    inclusions,
    exclusions,
    original_price,
    available_from,
    available_until,
  } = req.body;

  try {
    const updatedTour = await db.query(
      `UPDATE tours SET 
        name = $1, main_image_url = $2, is_active = $3, itinerary = $4, category_id = $5,
        short_description = $6, highlights = $7, inclusions = $8, exclusions = $9,
        original_price = $10, available_from = $11, available_until = $12, updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 RETURNING *`,
      [
        name,
        main_image_url,
        is_active,
        JSON.stringify(itinerary),
        category_id,
        short_description,
        highlights,
        inclusions,
        exclusions,
        original_price,
        available_from,
        available_until,
        id,
      ]
    );

    if (updatedTour.rowCount === 0) {
      return res.status(404).json({ error: "Tour not found." });
    }

    await logAdminAction(req.user.id, "UPDATE", "Tour", id, {
      name: updatedTour.rows[0].name,
    });

    res.status(200).json(updatedTour.rows[0]);
  } catch (error) {
    console.error(`Error updating tour #${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Delete an existing Tour.
 * @route DELETE /api/tours/:id
 * @access Private/Admin
 */
exports.deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteOp = await db.query(
      "DELETE FROM tours WHERE id = $1 RETURNING name",
      [id]
    );

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: "Tour not found." });
    }

    const tourName = deleteOp.rows[0].name;
    await logAdminAction(req.user.id, "DELETE", "Tour", id, {
      name: tourName,
    });

    res
      .status(200)
      .json({ message: `Tour '${tourName}' was deleted successfully.` });
  } catch (error) {
    console.error(`Error deleting tour #${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Get trending tours for homepage.
 * Returns tours marked as trending or bestsellers
 * @route GET /api/tours/trending
 * @access Public
 */
exports.getTrendingTours = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id,
        t.name,
        t.main_image_url,
        t.short_description,
        t.rating,
        t.review_count,
        t.original_price,
        t.discount_percentage,
        t.is_bestseller,
        t.is_trending,
        t.is_new,
        (t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) as final_price,
        tc.name as category_name
      FROM tours t
      LEFT JOIN tour_categories tc ON t.category_id = tc.id
      WHERE t.is_active = true AND (t.is_trending = true OR t.is_bestseller = true)
      ORDER BY t.is_bestseller DESC, t.is_trending DESC, t.booking_count DESC
      LIMIT 6
    `;

    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching trending tours:", error);
    res.status(500).json({
      message: "Error fetching trending tours",
      error: error.message,
    });
  }
};

/**
 * @description Get similar tours based on category and themes.
 * Returns tours with similar characteristics to the specified tour.
 * @route GET /api/tours/:id/similar
 * @access Public
 */
exports.getSimilarTours = async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;

  try {
    // First get the current tour's category and themes
    const currentTourResult = await db.query(
      "SELECT category_id, themes FROM tours WHERE id = $1",
      [id]
    );

    if (currentTourResult.rows.length === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }

    const { category_id, themes } = currentTourResult.rows[0];

    const query = `
      SELECT 
        t.id,
        t.name,
        t.main_image_url,
        t.short_description,
        t.rating,
        t.review_count,
        t.original_price,
        t.discount_percentage,
        t.avg_rating,
        (t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) as final_price,
        -- Calculate similarity score
        (
          CASE WHEN t.category_id = $1 THEN 2 ELSE 0 END +
          CASE WHEN t.themes && $2 THEN 1 ELSE 0 END
        ) as similarity_score
      FROM tours t
      WHERE t.is_active = true 
        AND t.id != $3
      ORDER BY similarity_score DESC, t.booking_count DESC
      LIMIT $4
    `;

    const result = await db.query(query, [category_id, themes, id, limit]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error fetching similar tours for tour ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Additional Functions ---

/**
 * @description Get tours by category
 * @route GET /api/tours/category/:categorySlug
 * @access Public
 */
exports.getToursByCategory = async (req, res) => {
  const { categorySlug } = req.params;
  const { limit = 12, offset = 0 } = req.query;

  try {
    const query = `
      SELECT 
        t.id,
        t.name,
        t.main_image_url,
        t.short_description,
        t.rating,
        t.review_count,
        t.original_price,
        t.discount_percentage,
        t.avg_rating,
        t.booking_count,
        (t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) as final_price
      FROM tours t
      JOIN tour_categories tc ON t.category_id = tc.id
      WHERE t.is_active = true AND tc.slug = $1
      ORDER BY t.is_featured DESC, t.booking_count DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [
      categorySlug,
      parseInt(limit),
      parseInt(offset),
    ]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*)
      FROM tours t
      JOIN tour_categories tc ON t.category_id = tc.id
      WHERE t.is_active = true AND tc.slug = $1
    `;

    const countResult = await db.query(countQuery, [categorySlug]);
    const totalCount = parseInt(countResult.rows[0].count);

    res.status(200).json({
      tours: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalCount,
      },
    });
  } catch (error) {
    console.error(`Error fetching tours for category ${categorySlug}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Get featured tours
 * @route GET /api/tours/featured
 * @access Public
 */
exports.getFeaturedTours = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id,
        t.name,
        t.main_image_url,
        t.short_description,
        t.rating,
        t.review_count,
        t.original_price,
        t.discount_percentage,
        t.avg_rating,
        (t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) as final_price,
        tc.name as category_name
      FROM tours t
      LEFT JOIN tour_categories tc ON t.category_id = tc.id
      WHERE t.is_active = true AND t.is_featured = true
      ORDER BY t.display_order, t.name
      LIMIT 8
    `;

    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching featured tours:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Get new tours
 * @route GET /api/tours/new
 * @access Public
 */
exports.getNewTours = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id,
        t.name,
        t.main_image_url,
        t.short_description,
        t.rating,
        t.review_count,
        t.original_price,
        t.discount_percentage,
        t.avg_rating,
        (t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) as final_price,
        tc.name as category_name
      FROM tours t
      LEFT JOIN tour_categories tc ON t.category_id = tc.id
      WHERE t.is_active = true AND t.is_new = true
      ORDER BY t.created_at DESC
      LIMIT 8
    `;

    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching new tours:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Recherche avancée de tours avec multiples filtres
 * @route GET /api/tours/advanced-search
 * @access Public
 */
// exports.advancedSearchTours = async (req, res) => {
//   const {
//     q, // Recherche texte
//     category,
//     destination,
//     minPrice,
//     maxPrice,
//     minRating,
//     maxRating,
//     minAge,
//     maxGroupSize,
//     adventureLevel,
//     isEcoFriendly,
//     isFamilyFriendly,
//     isCulturalImmersion,
//     themes,
//     inclusions,
//     duration,
//     availabilityFrom,
//     availabilityUntil,
//     sortBy = "popularity", // popularity, price_asc, price_desc, rating, newest, featured
//     limit = 12,
//     offset = 0,
//   } = req.query;

//   try {
//     let baseQuery = `
//       SELECT
//         t.id,
//         t.name,
//         t.main_image_url,
//         t.short_description,
//         t.rating,
//         t.review_count,
//         t.original_price,
//         t.discount_percentage,
//         t.themes,
//         t.destinations,
//         t.avg_rating,
//         t.booking_count,
//         t.view_count,
//         t.is_new,
//         t.is_featured,
//         t.is_bestseller,
//         t.is_trending,
//         t.min_age,
//         t.max_group_size,
//         t.adventure_level,
//         t.eco_friendly,
//         t.family_friendly,
//         t.cultural_immersion,
//         t.available_from,
//         t.available_until,
//         t.starting_location,
//         t.ending_location,
//         tc.name as category_name,
//         tc.slug as category_slug,
//         (t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) as final_price,
//         -- Calculer la durée approximative basée sur l'itinéraire
//         (SELECT COUNT(*) FROM jsonb_object_keys(t.itinerary)) as estimated_duration
//       FROM tours t
//       LEFT JOIN tour_categories tc ON t.category_id = tc.id
//       WHERE t.is_active = true
//     `;

//     const conditions = [];
//     const params = [];
//     let paramIndex = 1;

//     // Recherche texte
//     if (q) {
//       conditions.push(`
//         (t.name ILIKE $${paramIndex} OR
//         t.short_description ILIKE $${paramIndex} OR
//         t.highlights::text ILIKE $${paramIndex} OR
//         tc.name ILIKE $${paramIndex})
//       `);
//       params.push(`%${q}%`);
//       paramIndex++;
//     }

//     // Filtre par catégorie
//     if (category) {
//       conditions.push(`tc.slug = $${paramIndex}`);
//       params.push(category);
//       paramIndex++;
//     }

//     // Filtre par destination
//     if (destination) {
//       conditions.push(`$${paramIndex} = ANY(t.destinations)`);
//       params.push(destination);
//       paramIndex++;
//     }

//     // Filtre par prix
//     if (minPrice) {
//       conditions.push(
//         `(t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) >= $${paramIndex}`
//       );
//       params.push(parseFloat(minPrice));
//       paramIndex++;
//     }

//     if (maxPrice) {
//       conditions.push(
//         `(t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) <= $${paramIndex}`
//       );
//       params.push(parseFloat(maxPrice));
//       paramIndex++;
//     }

//     // Filtre par rating
//     if (minRating) {
//       conditions.push(`t.avg_rating >= $${paramIndex}`);
//       params.push(parseFloat(minRating));
//       paramIndex++;
//     }

//     if (maxRating) {
//       conditions.push(`t.avg_rating <= $${paramIndex}`);
//       params.push(parseFloat(maxRating));
//       paramIndex++;
//     }

//     // Filtre par âge minimum
//     if (minAge) {
//       conditions.push(`t.min_age <= $${paramIndex}`);
//       params.push(parseInt(minAge));
//       paramIndex++;
//     }

//     // Filtre par taille de groupe
//     if (maxGroupSize) {
//       conditions.push(`t.max_group_size >= $${paramIndex}`);
//       params.push(parseInt(maxGroupSize));
//       paramIndex++;
//     }

//     // Filtre par niveau d'aventure
//     if (adventureLevel) {
//       conditions.push(`t.adventure_level = $${paramIndex}`);
//       params.push(adventureLevel);
//       paramIndex++;
//     }

//     // Filtres booléens
//     if (isEcoFriendly === "true") {
//       conditions.push(`t.eco_friendly = true`);
//     }

//     if (isFamilyFriendly === "true") {
//       conditions.push(`t.family_friendly = true`);
//     }

//     if (isCulturalImmersion === "true") {
//       conditions.push(`t.cultural_immersion = true`);
//     }

//     // Filtre par thèmes
//     if (themes) {
//       const themeList = Array.isArray(themes) ? themes : themes.split(",");
//       conditions.push(`t.themes && $${paramIndex}::text[]`);
//       params.push(themeList);
//       paramIndex++;
//     }

//     // Filtre par inclusions (à adapter selon votre structure)
//     if (inclusions) {
//       const inclusionList = Array.isArray(inclusions)
//         ? inclusions
//         : inclusions.split(",");
//       conditions.push(`t.inclusions && $${paramIndex}::text[]`);
//       params.push(inclusionList);
//       paramIndex++;
//     }

//     // Filtre par durée
//     if (duration) {
//       conditions.push(
//         `(SELECT COUNT(*) FROM jsonb_object_keys(t.itinerary)) = $${paramIndex}`
//       );
//       params.push(parseInt(duration));
//       paramIndex++;
//     }

//     // Filtre par disponibilité
//     if (availabilityFrom) {
//       conditions.push(
//         `(t.available_from IS NULL OR t.available_from <= $${paramIndex}::date)`
//       );
//       params.push(availabilityFrom);
//       paramIndex++;
//     }

//     if (availabilityUntil) {
//       conditions.push(
//         `(t.available_until IS NULL OR t.available_until >= $${paramIndex}::date)`
//       );
//       params.push(availabilityUntil);
//       paramIndex++;
//     }

//     // Ajouter toutes les conditions à la requête
//     if (conditions.length > 0) {
//       baseQuery += " AND " + conditions.join(" AND ");
//     }

//     // Tri des résultats
//     switch (sortBy) {
//       case "price_asc":
//         baseQuery += " ORDER BY final_price ASC";
//         break;
//       case "price_desc":
//         baseQuery += " ORDER BY final_price DESC";
//         break;
//       case "rating":
//         baseQuery += " ORDER BY t.avg_rating DESC";
//         break;
//       case "newest":
//         baseQuery += " ORDER BY t.created_at DESC";
//         break;
//       case "featured":
//         baseQuery += " ORDER BY t.is_featured DESC, t.booking_count DESC";
//         break;
//       default: // popularity
//         baseQuery +=
//           " ORDER BY t.booking_count DESC, t.view_count DESC, t.avg_rating DESC";
//     }

//     // Pagination
//     baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
//     params.push(parseInt(limit), parseInt(offset));

//     // Exécution de la requête
//     const result = await db.query(baseQuery, params);

//     // Calcul du nombre total de résultats pour la pagination
//     let countQuery = `
//       SELECT COUNT(*)
//       FROM tours t
//       LEFT JOIN tour_categories tc ON t.category_id = tc.id
//       WHERE t.is_active = true
//     `;

//     if (conditions.length > 0) {
//       countQuery += " AND " + conditions.join(" AND ");
//     }

//     const countParams = params.slice(0, params.length - 2); // Exclure limit et offset
//     const countResult = await db.query(countQuery, countParams);
//     const totalCount = parseInt(countResult.rows[0].count);

//     // Récupération des images principales pour chaque tour
//     const toursWithImages = await Promise.all(
//       result.rows.map(async (tour) => {
//         const imagesResult = await db.query(
//           `SELECT image_url, caption, is_primary
//            FROM tour_images
//            WHERE tour_id = $1
//            ORDER BY is_primary DESC, display_order
//            LIMIT 3`,
//           [tour.id]
//         );

//         return {
//           ...tour,
//           images: imagesResult.rows,
//         };
//       })
//     );

//     res.status(200).json({
//       tours: toursWithImages,
//       pagination: {
//         limit: parseInt(limit),
//         offset: parseInt(offset),
//         total: totalCount,
//         hasMore: parseInt(offset) + parseInt(limit) < totalCount,
//       },
//     });
//   } catch (error) {
//     console.error("Error in advanced tour search:", error);
//     res.status(500).json({
//       error: "Internal server error",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

exports.advancedSearchTours = async (req, res) => {
  const {
    q, // Recherche texte
    category,
    destination,
    minPrice,
    maxPrice,
    minRating,
    maxRating,
    minAge,
    minGroupSize,
    maxGroupSize,
    adventureLevel,
    isEcoFriendly,
    isFamilyFriendly,
    isCulturalImmersion,
    themes,
    inclusions,
    duration,
    availabilityFrom,
    availabilityUntil,
    sortBy = "popularity", // popularity, price_asc, price_desc, rating, newest, featured
    limit = 9,
    page = 1, // Nouveau paramètre: numéro de page (remplace offset)
  } = req.query;

  try {
    let baseQuery = `
      SELECT 
        t.id,
        t.name,
        t.main_image_url,
        t.short_description,
        t.rating,
        t.review_count,
        t.original_price,
        t.discount_percentage,
        t.themes,
        t.destinations,
        t.avg_rating,
        t.booking_count,
        t.view_count,
        t.is_new,
        t.is_featured,
        t.is_bestseller,
        t.is_trending,
        t.min_age,
        t.max_group_size,
        t.adventure_level,
        t.eco_friendly,
        t.family_friendly,
        t.cultural_immersion,
        t.available_from,
        t.available_until,
        t.starting_location,
        t.ending_location,
        tc.name as category_name,
        tc.slug as category_slug,
        ROUND((t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100))::numeric, 2) as final_price,
        -- Calculer la durée approximative basée sur l'itinéraire ou duration_days
        COALESCE(t.duration_days, jsonb_array_length(t.itinerary), 0) as estimated_duration
      FROM tours t
      LEFT JOIN tour_categories tc ON t.category_id = tc.id
      WHERE t.is_active = true AND t.original_price IS NOT NULL
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Recherche texte
    if (q) {
      conditions.push(`
        (t.name ILIKE $${paramIndex} OR 
        t.short_description ILIKE $${paramIndex} OR
        t.highlights::text ILIKE $${paramIndex} OR
        tc.name ILIKE $${paramIndex})
      `);
      params.push(`%${q}%`);
      paramIndex++;
    }

    // Filtre par catégorie
    if (category) {
      conditions.push(`tc.slug = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    // Filtre par destination
    if (destination) {
      conditions.push(`$${paramIndex} = ANY(t.destinations)`);
      params.push(destination);
      paramIndex++;
    }

    // Filtre par prix
    if (minPrice) {
      conditions.push(
        `(t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) >= $${paramIndex}`
      );
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      conditions.push(
        `(t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) <= $${paramIndex}`
      );
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    // Filtre par rating
    if (minRating) {
      conditions.push(`t.avg_rating >= $${paramIndex}`);
      params.push(parseFloat(minRating));
      paramIndex++;
    }

    if (maxRating) {
      conditions.push(`t.avg_rating <= $${paramIndex}`);
      params.push(parseFloat(maxRating));
      paramIndex++;
    }

    // Filtre par âge minimum
    if (minAge) {
      conditions.push(`t.min_age >= $${paramIndex}`);
      params.push(parseInt(minAge));
      paramIndex++;
    }

    // Filtre par taille de groupe (intervalle)
    if (minGroupSize && maxGroupSize) {
      // Filtrer les tours dont max_group_size est dans l'intervalle
      conditions.push(
        `t.max_group_size >= $${paramIndex} AND t.max_group_size <= $${
          paramIndex + 1
        }`
      );
      params.push(parseInt(minGroupSize), parseInt(maxGroupSize));
      paramIndex += 2;
    } else if (minGroupSize) {
      conditions.push(`t.max_group_size >= $${paramIndex}`);
      params.push(parseInt(minGroupSize));
      paramIndex++;
    } else if (maxGroupSize) {
      conditions.push(`t.max_group_size <= $${paramIndex}`);
      params.push(parseInt(maxGroupSize));
      paramIndex++;
    }

    // Filtre par niveau d'aventure
    if (adventureLevel) {
      console.log("+++++++++++++");
      console.log(adventureLevel);
      console.log("+++++++++++++");
      conditions.push(`t.adventure_level = $${paramIndex}`);
      params.push(adventureLevel);
      paramIndex++;
    }

    // Filtres booléens
    if (isEcoFriendly === "true") {
      conditions.push(`t.eco_friendly = true`);
    }

    if (isFamilyFriendly === "true") {
      conditions.push(`t.family_friendly = true`);
    }

    if (isCulturalImmersion === "true") {
      conditions.push(`t.cultural_immersion = true`);
    }

    // Filtre par thèmes
    if (themes) {
      const themeList = Array.isArray(themes) ? themes : themes.split(",");
      conditions.push(`t.themes && $${paramIndex}::text[]`);
      params.push(themeList);
      paramIndex++;
    }

    // Filtre par inclusions (à adapter selon votre structure)
    if (inclusions) {
      const inclusionList = Array.isArray(inclusions)
        ? inclusions
        : inclusions.split(",");
      conditions.push(`t.inclusions && $${paramIndex}::text[]`);
      params.push(inclusionList);
      paramIndex++;
    }

    // Filtre par durée
    if (duration) {
      conditions.push(
        `COALESCE(t.duration_days, jsonb_array_length(t.itinerary), 0) = $${paramIndex}`
      );
      params.push(parseInt(duration));
      paramIndex++;
    }

    // Filtre par disponibilité
    if (availabilityFrom) {
      conditions.push(
        `(t.available_from IS NULL OR t.available_from <= $${paramIndex}::date)`
      );
      params.push(availabilityFrom);
      paramIndex++;
    }

    if (availabilityUntil) {
      conditions.push(
        `(t.available_until IS NULL OR t.available_until >= $${paramIndex}::date)`
      );
      params.push(availabilityUntil);
      paramIndex++;
    }

    // Ajouter toutes les conditions à la requête
    if (conditions.length > 0) {
      baseQuery += " AND " + conditions.join(" AND ");
    }

    // Tri des résultats
    switch (sortBy) {
      case "price_asc":
        baseQuery += " ORDER BY final_price ASC";
        break;
      case "price_desc":
        baseQuery += " ORDER BY final_price DESC";
        break;
      case "rating":
        baseQuery += " ORDER BY t.avg_rating DESC";
        break;
      case "newest":
        baseQuery += " ORDER BY t.created_at DESC";
        break;
      case "featured":
        baseQuery += " ORDER BY t.is_featured DESC, t.booking_count DESC";
        break;
      default: // popularity
        baseQuery +=
          " ORDER BY t.booking_count DESC, t.view_count DESC, t.avg_rating DESC";
    }

    // NOUVELLE PAGINATION: Calcul basé sur le numéro de page
    const currentPage = Math.max(1, parseInt(page) || 1);
    const itemsPerPage = Math.max(1, parseInt(limit) || 9);
    const offset = (currentPage - 1) * itemsPerPage;

    // Ajout de la pagination à la requête
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(itemsPerPage, offset);

    // Exécution de la requête principale
    console.log(`Executing query with params:`, params);
    const result = await db.query(baseQuery, params);

    // Calcul du nombre total de résultats pour la pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM tours t
      LEFT JOIN tour_categories tc ON t.category_id = tc.id
      WHERE t.is_active = true AND t.original_price IS NOT NULL
    `;

    if (conditions.length > 0) {
      countQuery += " AND " + conditions.join(" AND ");
    }

    const countParams = params.slice(0, params.length - 2); // Exclure limit et offset
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Calcul des informations de pagination complètes
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    console.log(`Pagination info:`, {
      currentPage,
      totalPages,
      totalCount,
      itemsPerPage,
      offset,
      hasNextPage,
      hasPrevPage,
    });

    // Récupération des images principales pour chaque tour
    const toursWithImages = await Promise.all(
      result.rows.map(async (tour) => {
        try {
          const imagesResult = await db.query(
            `SELECT image_url, caption, is_primary
             FROM tour_images
             WHERE tour_id = $1
             ORDER BY is_primary DESC, display_order
             LIMIT 3`,
            [tour.id]
          );

          return {
            ...tour,
            images: imagesResult.rows,
          };
        } catch (error) {
          console.error(`Error fetching images for tour ${tour.id}:`, error);
          return {
            ...tour,
            images: [],
          };
        }
      })
    );

    // Récupération des catégories disponibles (avec au moins un tour actif)
    const categoriesQuery = `
      SELECT DISTINCT
        tc.id,
        tc.name,
        tc.slug,
        tc.icon,
        tc.color_theme as color,
        tc.display_order
      FROM tour_categories tc
      INNER JOIN tours t ON t.category_id = tc.id
      WHERE t.is_active = true AND tc.is_active = true
      ORDER BY tc.display_order ASC, tc.name ASC
    `;

    const categoriesResult = await db.query(categoriesQuery);

    // Réponse finale avec la nouvelle structure de pagination
    res.status(200).json({
      success: true,
      tours: toursWithImages,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        itemsPerPage,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? currentPage + 1 : null,
        prevPage: hasPrevPage ? currentPage - 1 : null,
      },
      availableFilters: {
        categories: categoriesResult.rows,
      },
    });
  } catch (error) {
    console.error("Error in advanced tour search:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @description Get global statistics for all tours
 * @route GET /api/tours/statistics/global
 * @access Public
 */
exports.getGlobalStatistics = async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        COALESCE(SUM(booking_count), 0)::INTEGER as total_bookings,
        COALESCE(SUM(view_count), 0)::INTEGER as total_views,
        COALESCE(SUM(wishlist_count), 0)::INTEGER as total_wishlist,
        COUNT(*)::INTEGER as total_tours
      FROM tours
      WHERE is_active = true
    `;

    const result = await db.query(statsQuery);

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching global statistics:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @description Get addons for a specific tour
 * Fetches all active addons available for a tour
 * @route GET /api/tours/:id/addons
 * @access Public
 */
exports.getTourAddons = async (req, res) => {
  const { id } = req.params;

  try {
    const addonsResult = await db.query(
      `SELECT
        a.id,
        a.name,
        a.price,
        a.original_price,
        a.description,
        a.category,
        a.icon,
        a.duration,
        a.features,
        a.availability,
        a.rating,
        a.popularity,
        a.is_best_value,
        a.per_person,
        a.max_quantity,
        a.price_per_person
       FROM addons a
       INNER JOIN touraddons ta ON a.id = ta.addon_id
       WHERE ta.tour_id = $1 AND a.is_active = true
       ORDER BY a.display_order ASC`,
      [id]
    );

    res.status(200).json({
      tourId: parseInt(id),
      addons: addonsResult.rows,
    });
  } catch (error) {
    console.error(`Error fetching addons for tour ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Get vehicles for a specific tour with default vehicles per tier
 * Fetches all vehicles available for a tour including:
 * - Default vehicles for each package tier (included in price)
 * - Optional vehicles available for additional cost
 * - Tour duration for price calculation
 * @route GET /api/tours/:id/vehicles
 * @access Public
 */
exports.getTourVehicles = async (req, res) => {
  const { id } = req.params;

  try {
    // Get tour duration
    const tourResult = await db.query(
      `SELECT
        id,
        name,
        duration_days,
        max_group_size
       FROM tours
       WHERE id = $1`,
      [id]
    );

    if (tourResult.rows.length === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }

    const tour = tourResult.rows[0];

    // Get default vehicles for each tier with images
    const defaultVehiclesResult = await db.query(
      `SELECT
        pt.id as tier_id,
        pt.tier_name,
        pt.price as tier_price,
        v.id as vehicle_id,
        v.name,
        v.capacity,
        v.base_price_inr,
        v.type,
        v.icon,
        v.features,
        v.description,
        v.image_url,
        v.comfort_level
       FROM packagetiers pt
       LEFT JOIN vehicles v ON pt.included_vehicle_id = v.id
       WHERE pt.tour_id = $1
       ORDER BY
         CASE pt.tier_name
           WHEN 'Standard' THEN 1
           WHEN 'Comfort' THEN 2
           WHEN 'Premium' THEN 3
           WHEN 'Luxury' THEN 4
           ELSE 5
         END ASC`,
      [id]
    );

    // Get optional vehicles (vehicles available in tour_vehicles) with images
    const optionalVehiclesResult = await db.query(
      `SELECT DISTINCT
        v.id,
        v.name,
        v.capacity,
        v.base_price_inr,
        v.type,
        v.icon,
        v.features,
        v.description,
        v.image_url,
        v.comfort_level
       FROM vehicles v
       INNER JOIN tour_vehicles tv ON v.id = tv.vehicle_id
       WHERE tv.tour_id = $1
       ORDER BY v.capacity ASC`,
      [id]
    );

    // Helper function to fetch images for a vehicle
    const getVehicleImages = async (vehicleId) => {
      const imagesResult = await db.query(
        `SELECT image_url, display_order
         FROM vehicle_images
         WHERE vehicle_id = $1
         ORDER BY display_order ASC`,
        [vehicleId]
      );
      return imagesResult.rows.map((img) => img.image_url);
    };

    // Group default vehicles by tier and fetch their images
    const tierVehicles = {};
    for (const row of defaultVehiclesResult.rows) {
      if (row.vehicle_id) {
        const images = await getVehicleImages(row.vehicle_id);
        tierVehicles[row.tier_name] = {
          tierId: row.tier_id,
          tierName: row.tier_name,
          tierPrice: parseFloat(row.tier_price),
          vehicle: {
            id: row.vehicle_id,
            name: row.name,
            capacity: row.capacity,
            basePriceINR: parseFloat(row.base_price_inr),
            type: row.type,
            icon: row.icon,
            features: row.features,
            description: row.description,
            imageUrl: row.image_url, // Keep for backward compatibility
            images: images, // Array of 4 images for carousel
            comfortLevel: row.comfort_level,
            isIncluded: true,
          },
        };
      }
    }

    // Format optional vehicles and fetch their images
    const optionalVehicles = await Promise.all(
      optionalVehiclesResult.rows.map(async (v) => {
        const images = await getVehicleImages(v.id);
        return {
          id: v.id,
          name: v.name,
          capacity: v.capacity,
          basePriceINR: parseFloat(v.base_price_inr),
          totalPrice: parseFloat(v.base_price_inr) * (tour.duration_days || 1),
          type: v.type,
          icon: v.icon,
          features: v.features,
          description: v.description,
          imageUrl: v.image_url, // Keep for backward compatibility
          images: images, // Array of 4 images for carousel
          comfortLevel: v.comfort_level,
          isIncluded: false,
        };
      })
    );

    res.status(200).json({
      tourId: parseInt(id),
      tourName: tour.name,
      durationDays: tour.duration_days || 1,
      maxGroupSize: tour.max_group_size,
      defaultVehiclesByTier: tierVehicles,
      optionalVehicles: optionalVehicles,
    });
  } catch (error) {
    console.error(`Error fetching vehicles for tour ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * @description Get all package tiers for a specific tour
 * @route GET /api/tours/:id/tiers
 * @access Public
 */
exports.getTourTiers = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT
        id,
        tier_name as name,
        price,
        hotel_type,
        inclusions_summary,
        exclusions_summary,
        accommodation_name,
        accommodation_rating
       FROM packagetiers
       WHERE tour_id = $1
       ORDER BY price ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(`Error fetching tiers for tour ${id}:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};
