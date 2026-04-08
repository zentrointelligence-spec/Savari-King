// ======================================================================
// FILE: `backend/src/services/destinationService.js`
// Role: Centralized service for all destination-related business logic
// ======================================================================

const db = require("../db");

/**
 * Calculate popularity score for a destination
 * @param {Object} destination - Destination object with stats
 * @param {Object} weights - Custom weights for scoring (optional)
 * @returns {Number} Popularity score
 */
function calculatePopularityScore(destination, weights = {}) {
  const defaultWeights = {
    tourCount: 0.25,
    avgRating: 0.20,
    totalBookings: 0.30,
    wishlistCount: 0.10,
    featuredBonus: 10,
    trendingBonus: 5,
  };

  const w = { ...defaultWeights, ...weights };

  const score =
    (destination.tour_count || 0) * w.tourCount +
    (destination.avg_rating || 0) * 5 * w.avgRating +
    (destination.total_bookings || 0) * w.totalBookings +
    (destination.wishlist_count || 0) * w.wishlistCount +
    (destination.is_featured ? w.featuredBonus : 0) +
    (destination.is_trending ? w.trendingBonus : 0);

  return parseFloat(score.toFixed(2));
}

/**
 * Get enriched destinations with all related data
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Query options (limit, offset, orderBy)
 * @returns {Array} Array of enriched destinations
 */
async function getEnrichedDestinations(filters = {}, options = {}) {
  const {
    regions,
    budgetCategories,
    adventureLevels,
    flags,
    minRating,
    maxPrice,
    activities,
    search,
    isActive = true,
  } = filters;

  const { limit = 50, offset = 0, orderBy = "popularity_score DESC" } = options;

  let query = `
    SELECT
      d.*,
      -- Calculate popularity score
      (
        (d.tour_count * 0.25) +
        (d.avg_rating * 5 * 0.20) +
        (d.total_bookings * 0.30) +
        (d.wishlist_count * 0.10) +
        (CASE WHEN d.is_featured THEN 10 ELSE 0 END) +
        (CASE WHEN d.is_trending THEN 5 ELSE 0 END)
      ) as popularity_score,
      -- Get current ideal season
      (
        SELECT ds.season
        FROM destination_seasons ds
        WHERE ds.destination_id = d.id
          AND ds.is_ideal = true
        LIMIT 1
      ) as current_season,
      (
        SELECT ds.description
        FROM destination_seasons ds
        WHERE ds.destination_id = d.id
          AND ds.is_ideal = true
        LIMIT 1
      ) as current_season_description,
      -- Get upcoming festivals (next 3 months)
      (
        SELECT jsonb_agg(festival ORDER BY (festival->>'date')::date)
        FROM jsonb_array_elements(d.festivals_events) festival
        WHERE (festival->>'date')::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 months'
      ) as upcoming_festivals
    FROM destinations d
    WHERE d.is_active = $1
  `;

  const params = [isActive];
  let paramIndex = 2;
  const conditions = [];

  // Full-text search
  if (search) {
    conditions.push(`(
      to_tsvector('english', d.name || ' ' || COALESCE(d.description, '') || ' ' || COALESCE(d.short_description, ''))
      @@ plainto_tsquery('english', $${paramIndex})
    )`);
    params.push(search);
    paramIndex++;
  }

  // Region filter
  if (regions && regions.length > 0) {
    conditions.push(`d.region = ANY($${paramIndex})`);
    params.push(regions);
    paramIndex++;
  }

  // Budget category filter
  if (budgetCategories && budgetCategories.length > 0) {
    conditions.push(`d.budget_category = ANY($${paramIndex})`);
    params.push(budgetCategories);
    paramIndex++;
  }

  // Adventure level filter
  if (adventureLevels && adventureLevels.length > 0) {
    conditions.push(`d.adventure_level = ANY($${paramIndex})`);
    params.push(adventureLevels);
    paramIndex++;
  }

  // Special flags filter
  if (flags && flags.length > 0) {
    const flagConditions = [];
    if (flags.includes("unesco")) flagConditions.push("d.unesco_site = true");
    if (flags.includes("wildlife"))
      flagConditions.push("d.wildlife_sanctuary = true");
    if (flags.includes("heritage"))
      flagConditions.push("d.heritage_site = true");
    if (flags.includes("eco_friendly"))
      flagConditions.push("d.eco_friendly = true");
    if (flags.includes("family_friendly"))
      flagConditions.push("d.family_friendly = true");

    if (flagConditions.length > 0) {
      conditions.push(`(${flagConditions.join(" OR ")})`);
    }
  }

  // Minimum rating filter
  if (minRating) {
    conditions.push(`d.avg_rating >= $${paramIndex}`);
    params.push(minRating);
    paramIndex++;
  }

  // Maximum price filter
  if (maxPrice) {
    conditions.push(`d.price_range_min <= $${paramIndex}`);
    params.push(maxPrice);
    paramIndex++;
  }

  // Activities filter
  if (activities && activities.length > 0) {
    conditions.push(`d.activities && $${paramIndex}`);
    params.push(activities);
    paramIndex++;
  }

  // Add conditions to query
  if (conditions.length > 0) {
    query += " AND " + conditions.join(" AND ");
  }

  // Add ordering and pagination
  query += ` ORDER BY ${orderBy} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await db.query(query, params);

  // Format the results
  return result.rows.map(formatDestinationResponse);
}

/**
 * Get top destinations by popularity
 * @param {Number} limit - Number of destinations to return
 * @param {String} criteria - Sorting criteria (popularity, rating, bookings, trending)
 * @returns {Array} Top destinations
 */
async function getTopDestinations(limit = 6, criteria = "popularity") {
  let orderBy = "popularity_score DESC, d.avg_rating DESC";

  switch (criteria) {
    case "rating":
      orderBy = "d.avg_rating DESC, d.review_count DESC";
      break;
    case "bookings":
      orderBy = "d.total_bookings DESC";
      break;
    case "trending":
      orderBy = "d.is_trending DESC, popularity_score DESC";
      break;
    case "featured":
      orderBy = "d.is_featured DESC, popularity_score DESC";
      break;
    default:
      orderBy = "popularity_score DESC, d.avg_rating DESC";
  }

  return getEnrichedDestinations({}, { limit, orderBy });
}

/**
 * Get destination by ID with full details
 * @param {Number} destinationId - Destination ID
 * @returns {Object} Destination details
 */
async function getDestinationById(destinationId) {
  const query = `
    SELECT
      d.*,
      (
        (d.tour_count * 0.25) +
        (d.avg_rating * 5 * 0.20) +
        (d.total_bookings * 0.30) +
        (d.wishlist_count * 0.10) +
        (CASE WHEN d.is_featured THEN 10 ELSE 0 END) +
        (CASE WHEN d.is_trending THEN 5 ELSE 0 END)
      ) as popularity_score,
      NULL as current_season,
      NULL as current_season_description,
      NULL as all_seasons,
      (
        SELECT jsonb_agg(festival ORDER BY (festival->>'date')::date)
        FROM jsonb_array_elements(d.festivals_events) festival
        WHERE (festival->>'date')::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '6 months'
      ) as upcoming_festivals,
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', dc.id,
            'name', dc.name,
            'icon', dc.icon,
            'color', dc.color
          )
        )
        FROM destination_category_assignments dca
        JOIN destination_categories dc ON dca.category_id = dc.id
        WHERE dca.destination_id = d.id
      ) as categories
    FROM destinations d
    WHERE d.id = $1 AND d.is_active = true
  `;

  const result = await db.query(query, [destinationId]);

  if (result.rows.length === 0) {
    return null;
  }

  return formatDestinationResponse(result.rows[0]);
}

/**
 * Get related destinations based on similarity
 * @param {Number} destinationId - Source destination ID
 * @param {Number} limit - Number of related destinations to return
 * @returns {Array} Related destinations
 */
async function getRelatedDestinations(destinationId, limit = 4) {
  const query = `
    WITH source_dest AS (
      SELECT budget_category, adventure_level, activities, region
      FROM destinations
      WHERE id = $1
    )
    SELECT
      d.*,
      (
        (d.tour_count * 0.25) +
        (d.avg_rating * 5 * 0.20) +
        (d.total_bookings * 0.30) +
        (d.wishlist_count * 0.10) +
        (CASE WHEN d.is_featured THEN 10 ELSE 0 END) +
        (CASE WHEN d.is_trending THEN 5 ELSE 0 END)
      ) as popularity_score,
      -- Similarity score
      (
        (CASE WHEN d.budget_category = (SELECT budget_category FROM source_dest) THEN 10 ELSE 0 END) +
        (CASE WHEN d.adventure_level = (SELECT adventure_level FROM source_dest) THEN 10 ELSE 0 END) +
        (CASE WHEN d.activities && (SELECT activities FROM source_dest) THEN 15 ELSE 0 END) +
        (CASE WHEN d.region = (SELECT region FROM source_dest) THEN 5 ELSE 0 END)
      ) as similarity_score
    FROM destinations d, source_dest
    WHERE d.is_active = true
      AND d.id != $1
    ORDER BY similarity_score DESC, popularity_score DESC
    LIMIT $2
  `;

  const result = await db.query(query, [destinationId, limit]);
  return result.rows.map(formatDestinationResponse);
}

/**
 * Get nearby destinations based on geographical proximity
 * @param {Number} destinationId - Source destination ID
 * @param {Number} radiusKm - Radius in kilometers (default 500km)
 * @param {Number} limit - Number of destinations to return
 * @returns {Array} Nearby destinations
 */
async function getNearbyDestinations(
  destinationId,
  radiusKm = 500,
  limit = 4
) {
  const query = `
    WITH source_location AS (
      SELECT latitude, longitude
      FROM destinations
      WHERE id = $1 AND latitude IS NOT NULL AND longitude IS NOT NULL
    ),
    destinations_with_distance AS (
      SELECT
        d.*,
        (
          (d.tour_count * 0.25) +
          (d.avg_rating * 5 * 0.20) +
          (d.total_bookings * 0.30) +
          (d.wishlist_count * 0.10) +
          (CASE WHEN d.is_featured THEN 10 ELSE 0 END) +
          (CASE WHEN d.is_trending THEN 5 ELSE 0 END)
        ) as popularity_score,
        -- Calculate distance in km using Haversine formula
        (
          6371 * acos(
            cos(radians((SELECT latitude FROM source_location))) *
            cos(radians(d.latitude)) *
            cos(radians(d.longitude) - radians((SELECT longitude FROM source_location))) +
            sin(radians((SELECT latitude FROM source_location))) *
            sin(radians(d.latitude))
          )
        ) as distance_km
      FROM destinations d, source_location
      WHERE d.is_active = true
        AND d.id != $1
        AND d.latitude IS NOT NULL
        AND d.longitude IS NOT NULL
    )
    SELECT *
    FROM destinations_with_distance
    WHERE distance_km <= $2
    ORDER BY distance_km ASC, popularity_score DESC
    LIMIT $3
  `;

  const result = await db.query(query, [destinationId, radiusKm, limit]);
  return result.rows.map((dest) => ({
    ...formatDestinationResponse(dest),
    distance_km: parseFloat(dest.distance_km).toFixed(2),
  }));
}

/**
 * Get destination statistics
 * @param {Number} destinationId - Destination ID
 * @returns {Object} Destination statistics
 */
async function getDestinationStats(destinationId) {
  const query = `
    SELECT
      d.tour_count,
      d.total_bookings,
      d.avg_rating,
      d.review_count,
      d.view_count,
      d.wishlist_count,
      d.price_range_min,
      d.price_range_max,
      d.budget_category,
      (
        SELECT COUNT(*)
        FROM destination_likes dl
        WHERE dl.destination_id = d.id
      ) as total_likes,
      (
        SELECT COUNT(DISTINCT t.id)
        FROM tour_destinations td
        JOIN tours t ON td.tour_id = t.id
        WHERE td.destination_id = d.id AND t.is_active = true
      ) as active_tours
    FROM destinations d
    WHERE d.id = $1
  `;

  const result = await db.query(query, [destinationId]);

  if (result.rows.length === 0) {
    return null;
  }

  return {
    tourCount: parseInt(result.rows[0].tour_count) || 0,
    totalBookings: parseInt(result.rows[0].total_bookings) || 0,
    avgRating: parseFloat(result.rows[0].avg_rating) || 0,
    reviewCount: parseInt(result.rows[0].review_count) || 0,
    viewCount: parseInt(result.rows[0].view_count) || 0,
    wishlistCount: parseInt(result.rows[0].wishlist_count) || 0,
    totalLikes: parseInt(result.rows[0].total_likes) || 0,
    activeTours: parseInt(result.rows[0].active_tours) || 0,
    priceRange: {
      min: parseFloat(result.rows[0].price_range_min) || 0,
      max: parseFloat(result.rows[0].price_range_max) || 0,
    },
    budgetCategory: result.rows[0].budget_category,
  };
}

/**
 * Format destination response with structured data
 * @param {Object} destination - Raw destination from database
 * @returns {Object} Formatted destination
 */
function formatDestinationResponse(destination) {
  return {
    id: destination.id,
    name: destination.name,
    slug: destination.slug,
    description: destination.description,
    shortDescription: destination.short_description,

    location: {
      country: destination.country,
      state: destination.state,
      region: destination.region,
      latitude: destination.latitude
        ? parseFloat(destination.latitude)
        : null,
      longitude: destination.longitude
        ? parseFloat(destination.longitude)
        : null,
      timezone: destination.timezone,
    },

    images: {
      main: destination.main_image_url,
      featured: destination.featured_image,
      thumbnail: destination.thumbnail_image,
      gallery: destination.gallery_images || [],
      video: destination.video_url,
    },

    timing: {
      bestTimeToVisit: destination.best_time_to_visit,
      peakSeason: destination.peak_season,
      offSeason: destination.off_season,
      currentSeason: destination.current_season || null,
      currentSeasonDescription: destination.current_season_description || null,
      recommendedDuration: destination.recommended_duration,
      allSeasons: destination.all_seasons || [],
      upcomingFestivals: destination.upcoming_festivals || [],
    },

    climate: {
      info: destination.climate_info,
      weatherData: destination.weather_data || {},
    },

    attractions: {
      top: destination.top_attractions || [],
      activities: destination.activities || [],
      specialties: destination.specialties || [],
      culturalHighlights: destination.cultural_highlights || [],
    },

    stats: {
      tourCount: parseInt(destination.tour_count) || 0,
      avgRating: parseFloat(destination.avg_rating) || 0,
      reviewCount: parseInt(destination.review_count) || 0,
      totalBookings: parseInt(destination.total_bookings) || 0,
      wishlistCount: parseInt(destination.wishlist_count) || 0,
      viewCount: parseInt(destination.view_count) || 0,
      popularityScore: destination.popularity_score
        ? parseFloat(destination.popularity_score)
        : 0,
    },

    pricing: {
      min: parseFloat(destination.price_range_min) || 0,
      max: parseFloat(destination.price_range_max) || 0,
      budgetCategory: destination.budget_category,
    },

    flags: {
      isFeatured: destination.is_featured || false,
      isPopular: destination.is_popular || false,
      isTrending: destination.is_trending || false,
      isUNESCO: destination.unesco_site || false,
      isHeritageSite: destination.heritage_site || false,
      isWildlifeSanctuary: destination.wildlife_sanctuary || false,
      isFamilyFriendly: destination.family_friendly || false,
      ecoFriendly: destination.eco_friendly || false,
    },

    logistics: {
      nearestAirport: destination.nearest_airport,
      nearestRailway: destination.nearest_railway,
      localTransport: destination.local_transport,
      howToReach: destination.how_to_reach,
      accommodationTypes: destination.accommodation_types || [],
    },

    recommendations: {
      duration: destination.recommended_duration,
      difficultyLevel: destination.difficulty_level,
      adventureLevel: destination.adventure_level,
    },

    travelInfo: {
      travelTips: destination.travel_tips,
      localCustoms: destination.local_customs,
      safetyInfo: destination.safety_info,
      packingSuggestions: destination.packing_suggestions || [],
      localLanguage: destination.local_language,
      currency: destination.currency,
      timezoneOffset: destination.time_zone_offset,
    },

    seo: {
      metaTitle: destination.meta_title,
      metaDescription: destination.meta_description,
      metaKeywords: destination.meta_keywords,
      canonicalUrl: destination.canonical_url,
      ogImage: destination.og_image,
    },

    categories: destination.categories || [],
    relatedDestinations: destination.related_destinations || [],
    nearbyDestinations: destination.nearby_destinations || [],
  };
}

module.exports = {
  calculatePopularityScore,
  getEnrichedDestinations,
  getTopDestinations,
  getDestinationById,
  getRelatedDestinations,
  getNearbyDestinations,
  getDestinationStats,
  formatDestinationResponse,
};
