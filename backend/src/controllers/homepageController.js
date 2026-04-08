const pool = require("../db");

exports.getHomepageToursCategories = async (req, res) => {
  try {
    const query = `
    SELECT id, 
      name, 
      slug, 
      description, 
      icon,
      active_tour_count,
      avg_rating,
      is_new 
    FROM tour_categories
    WHERE is_active = true AND active_tour_count >= 1
    ORDER BY display_order ASC, name ASC
    LIMIT $1;`;

    const limit = parseInt(req.query.limit) || 8;
    const { rows } = await pool.query(query, [limit]);

    const categories = rows.map((tour_category) => ({
      id: tour_category.id,
      name: tour_category.name,
      slug: tour_category.slug,
      icon: tour_category.icon,
      tourCount: tour_category.active_tour_count,
      isNew: tour_category.is_new,
      description: tour_category.description,
      averageRating: tour_category.avg_rating,
    }));

    res.status(200).json({
      status: 200,
      data: categories,
    });
  } catch (error) {
    console.error("Can't get tour categories:", error);
    res.status(200).json({
      status: 200,
      data: [],
      message: "Catégories temporairement indisponibles",
    });
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    // Requête simplifiée et optimisée
    const query = `
        SELECT 
          t.id,
          t.name,
          t.slug,
          t.main_image_url,
          t.thumbnail_image,
          t.original_price,
          t.discount_percentage,
          t.max_group_size,
          t.rating,
          t.review_count,
          t.booking_count,
          t.is_bestseller,
          t.is_featured,
          t.is_new,
          t.starting_location,
          t.highlights,
          -- Score de popularité simplifié
          (
            (t.booking_count * 0.4) + 
            (t.rating * COALESCE(t.review_count, 1) * 0.1) +
            (CASE WHEN t.is_bestseller THEN 10 ELSE 0 END)
          ) as popularity_score
        FROM tours t
        WHERE t.is_active = true
          AND (t.available_from IS NULL OR t.available_from <= CURRENT_DATE)
          AND (t.available_until IS NULL OR t.available_until >= CURRENT_DATE)
          AND t.is_bestseller = true
        ORDER BY popularity_score DESC, t.rating DESC
        LIMIT $1;
      `;

    const limit = parseInt(req.query.limit) || 3;
    const { rows } = await pool.query(query, [limit]);

    const bestSellers = rows.map((tour) => ({
      id: tour.id,
      name: tour.name,
      slug: tour.slug,
      mainImage: tour.main_image_url,
      thumbnailImage: tour.thumbnail_image,
      price:
        parseFloat(tour.original_price || 0) *
        (1 - parseFloat(tour.discount_percentage || 0) / 100),

      originalPrice: parseFloat(tour.original_price || 0),
      maxGroupSize: tour.max_group_size,
      rating: parseFloat(tour.rating || 0),
      reviewCount: tour.review_count || 0,
      bookingCount: tour.booking_count || 0,
      badges: {
        isBestseller: tour.is_bestseller,
        isFeatured: tour.is_featured,
        isNew: tour.is_new,
      },
      startingLocation: tour.starting_location,
      highlights: tour.highlights || [],
    }));

    res.status(200).json({
      status: 200,
      data: bestSellers,
    });
  } catch (err) {
    console.error("Can't get tour best sellers:", err);
    res.status(200).json({
      status: 200,
      data: [],
      message: "Best-sellers temporairement indisponibles",
    });
  }
};

exports.getPopularDestinations = async (req, res) => {
  try {
    const destinationService = require('../services/destinationService');
    const limit = parseInt(req.query.limit) || 3;

    const destinations = await destinationService.getTopDestinations(limit, 'popularity');

    // Format for homepage compatibility (keep both old and new formats)
    const formattedDestinations = destinations.map((dest) => ({
      id: dest.id,
      name: dest.name,
      slug: dest.slug,
      mainImage: dest.images.main,
      image_url: dest.images.main, // Alias pour compatibilité frontend
      thumbnailImage: dest.images.thumbnail,
      description: dest.shortDescription, // Frontend attend 'description'
      shortDescription: dest.shortDescription,
      country: dest.location.country, // Champ direct pour compatibilité
      location: dest.location,
      isFeatured: dest.flags.isFeatured,
      tourCount: dest.stats.tourCount, // Convertir en nombre
      averageRating: dest.stats.avgRating, // Frontend attend averageRating
      avgRating: dest.stats.avgRating,
      popularityScore: dest.stats.popularityScore,
    }));

    res.status(200).json({
      status: 200,
      data: formattedDestinations,
    });
  } catch (err) {
    console.error("Can't get popular destinations:", err);
    res.status(200).json({
      status: 200,
      data: [],
      message: "Destinations populaires temporairement indisponibles",
    });
  }
};

exports.getActiveSpecialOffers = async (req, res) => {
  try {
    // Requête simplifiée
    const query = `
      SELECT 
        so.id,
        so.title,
        so.slug,
        so.short_description,
        so.offer_type,
        so.discount_percentage,
        so.discount_amount,
        so.valid_from,
        so.valid_until,
        so.promo_code,
        so.is_featured,
        so.banner_image,
        so.thumbnail_image,
        -- Statut de validité
        CASE 
          WHEN so.is_active = false THEN 'inactive'
          WHEN NOW() < so.valid_from THEN 'upcoming'
          WHEN NOW() > so.valid_until THEN 'expired'
          ELSE 'active'
        END as status,
        -- Jours restants
        CASE 
          WHEN NOW() BETWEEN so.valid_from AND so.valid_until 
          THEN DATE_PART('day', so.valid_until - NOW()) 
          ELSE 0 
        END as days_remaining
      FROM special_offers so
      WHERE so.is_active = true
        AND so.valid_until >= NOW()
        AND (so.usage_limit IS NULL OR so.usage_count < so.usage_limit)
      ORDER BY 
        so.is_featured DESC,
        so.display_order ASC,
        so.valid_until ASC
      LIMIT $1;
    `;

    const limit = parseInt(req.query.limit) || 10;
    const { rows } = await pool.query(query, [limit]);

    const offers = rows.map((offer) => ({
      id: offer.id,
      title: offer.title,
      slug: offer.slug,
      shortDescription: offer.short_description,
      offerType: offer.offer_type,
      discountPercentage: parseFloat(offer.discount_percentage || 0),
      discountAmount: parseFloat(offer.discount_amount || 0),
      validFrom: offer.valid_from,
      validUntil: offer.valid_until,
      promoCode: offer.promo_code,
      isFeatured: offer.is_featured,
      bannerImage: offer.banner_image,
      thumbnailImage: offer.thumbnail_image,
      status: offer.status,
      daysRemaining: parseInt(offer.days_remaining || 0),
      isValid: offer.status === "active",
    }));

    res.status(200).json({
      status: 200,
      data: offers,
    });
  } catch (err) {
    console.error("Can't get active special offers:", err);
    res.status(200).json({
      status: 200,
      data: [],
      message: "Offres spéciales temporairement indisponibles",
    });
  }
};

exports.getTravelGuides = async (req, res) => {
  try {
    // Requête optimisée - filtrée sur la catégorie 'travel-guides'
    const query = `
      SELECT DISTINCT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image_url,
        bp.thumbnail_image,
        bp.author_id,
        bp.view_count,
        bp.is_featured,
        bp.published_at,
        bp.reading_time,
        bp.avg_rating,
        bp.rating_count,
        -- Score de popularité simplifié
        (
          (bp.view_count * 0.3) +
          (COALESCE(bp.avg_rating, 0) * COALESCE(bp.rating_count, 1) * 0.5) +
          (CASE WHEN bp.is_featured THEN 15 ELSE 0 END)
        ) as popularity_score
      FROM blog_posts bp
      JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE bp.is_published = true
        AND bp.moderation_status = 'approved'
        AND (bp.published_at IS NULL OR bp.published_at <= CURRENT_TIMESTAMP)
        AND bc.slug = 'travel-guides'
      ORDER BY
        bp.is_featured DESC,
        popularity_score DESC,
        bp.published_at DESC NULLS LAST
      LIMIT $1;
    `;

    const limit = parseInt(req.query.limit) || 4;
    const { rows } = await pool.query(query, [limit]);

    const travelGuides = rows.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featured_image_url,
      thumbnailImage: post.thumbnail_image,
      authorId: post.author_id,
      metrics: {
        viewCount: post.view_count || 0,
        rating: parseFloat(post.avg_rating || 0),
        ratingCount: post.rating_count || 0,
        readingTime: post.reading_time || 0,
      },
      isFeatured: post.is_featured,
      publishedAt: post.published_at,
      popularityScore: parseFloat(post.popularity_score || 0).toFixed(2),
    }));

    res.status(200).json({
      status: 200,
      data: travelGuides,
      total: travelGuides.length,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des travel guides:", err);
    res.status(200).json({
      status: 200,
      data: [],
      message: "Guides de voyage temporairement indisponibles",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
