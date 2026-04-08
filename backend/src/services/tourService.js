const pool = require('../db');

/**
 * Service pour la gestion des tours avec logique métier avancée
 * Inclut les calculs de bestsellers, prix moyens et statistiques
 * Basé sur DATABASE_DOCUMENTATION.md pour une architecture robuste
 */
class TourService {
  /**
   * Récupère les tours avec filtres avancés et tri par popularité
   * @param {Object} filters - Filtres de recherche
   * @param {Object} options - Options de pagination et tri
   * @returns {Object} Tours filtrés avec métadonnées
   */
  static async getToursWithFilters(filters = {}, options = {}) {
    try {
      const {
        destination,
        category,
        minPrice,
        maxPrice,
        duration,
        rating,
        groupSize,
        sortBy = 'popularity',
        page = 1,
        limit = 12
      } = { ...filters, ...options };

      const offset = (page - 1) * limit;
      const conditions = ['t.is_active = true'];
      const params = [];
      let paramIndex = 1;

      // Construction dynamique des filtres
      if (destination) {
        conditions.push(`EXISTS (
          SELECT 1 FROM tour_destinations td 
          JOIN destinations d ON td.destination_id = d.id 
          WHERE td.tour_id = t.id AND (d.slug = $${paramIndex} OR d.name ILIKE $${paramIndex + 1})
        )`);
        params.push(destination, `%${destination}%`);
        paramIndex += 2;
      }

      if (category) {
        conditions.push(`EXISTS (
          SELECT 1 FROM tour_category_assignments tca 
          JOIN tour_categories tc ON tca.category_id = tc.id 
          WHERE tca.tour_id = t.id AND (tc.slug = $${paramIndex} OR tc.name ILIKE $${paramIndex + 1})
        )`);
        params.push(category, `%${category}%`);
        paramIndex += 2;
      }

      if (minPrice) {
        conditions.push(`t.price_from >= $${paramIndex}`);
        params.push(minPrice);
        paramIndex++;
      }

      if (maxPrice) {
        conditions.push(`t.price_from <= $${paramIndex}`);
        params.push(maxPrice);
        paramIndex++;
      }

      if (duration) {
        conditions.push(`t.duration_days = $${paramIndex}`);
        params.push(duration);
        paramIndex++;
      }

      if (rating) {
        conditions.push(`t.rating >= $${paramIndex}`);
        params.push(rating);
        paramIndex++;
      }

      if (groupSize) {
        conditions.push(`t.group_size_max >= $${paramIndex}`);
        params.push(groupSize);
        paramIndex++;
      }

      // Définition du tri
      let orderBy = '';
      switch (sortBy) {
        case 'price_asc':
          orderBy = 'ORDER BY t.price_from ASC';
          break;
        case 'price_desc':
          orderBy = 'ORDER BY t.price_from DESC';
          break;
        case 'rating':
          orderBy = 'ORDER BY avg_rating DESC, review_count DESC';
          break;
        case 'newest':
          orderBy = 'ORDER BY t.created_at DESC';
          break;
        case 'popularity':
        default:
          orderBy = 'ORDER BY popularity_score DESC';
          break;
      }

      const query = `
        SELECT 
          t.id,
          t.name,
          t.slug,
          t.description,
          t.main_image_url,
          t.price_from,
          t.duration_days,
          t.group_size_max,
          t.min_age,
          t.rating,
          t.total_bookings,
          t.view_count,
          t.created_at,
          COALESCE(AVG(r.rating), 0) as avg_rating,
          COUNT(r.id) as review_count,
          array_agg(DISTINCT tc.name) FILTER (WHERE tc.name IS NOT NULL) as categories,
          array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL) as destinations,
          -- Score de popularité calculé
          (t.total_bookings * 0.4 + t.view_count * 0.3 + COALESCE(AVG(r.rating), 0) * 0.3) as popularity_score,
          -- Indicateur bestseller
          CASE WHEN t.total_bookings > (
            SELECT AVG(total_bookings) * 1.5 FROM tours WHERE is_active = true
          ) THEN true ELSE false END as is_bestseller
        FROM tours t
        LEFT JOIN reviews r ON t.id = r.tour_id AND r.is_approved = true
        LEFT JOIN tour_category_assignments tca ON t.id = tca.tour_id
        LEFT JOIN tour_categories tc ON tca.category_id = tc.id
        LEFT JOIN tour_destinations td ON t.id = td.tour_id
        LEFT JOIN destinations d ON td.destination_id = d.id
        WHERE ${conditions.join(' AND ')}
        GROUP BY t.id, t.name, t.slug, t.description, t.main_image_url, t.price_from, 
                 t.duration_days, t.group_size_max, t.min_age, t.rating, t.total_bookings, 
                 t.view_count, t.created_at
        ${orderBy}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(limit, offset);

      // Requête pour le total
      const countQuery = `
        SELECT COUNT(DISTINCT t.id) as total
        FROM tours t
        LEFT JOIN tour_category_assignments tca ON t.id = tca.tour_id
        LEFT JOIN tour_categories tc ON tca.category_id = tc.id
        LEFT JOIN tour_destinations td ON t.id = td.tour_id
        LEFT JOIN destinations d ON td.destination_id = d.id
        WHERE ${conditions.join(' AND ')}
      `;

      const [toursResult, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, params.slice(0, -2)) // Exclure limit et offset
      ]);

      const tours = toursResult.rows.map(tour => ({
        ...tour,
        avg_rating: parseFloat(tour.avg_rating || 0).toFixed(1),
        price_from: parseFloat(tour.price_from || 0),
        categories: tour.categories || [],
        destinations: tour.destinations || [],
        popularity_score: parseFloat(tour.popularity_score || 0).toFixed(2)
      }));

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        tours,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          applied: filters,
          sortBy
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des tours filtrés:', error);
      throw new Error('Impossible de récupérer les tours');
    }
  }

  /**
   * Calcule les statistiques des prix pour une catégorie ou destination
   * @param {string} type - 'category' ou 'destination'
   * @param {string} identifier - Slug de la catégorie ou destination
   * @returns {Object} Statistiques des prix
   */
  static async getPriceStatistics(type, identifier) {
    try {
      let joinClause = '';
      let whereClause = '';

      if (type === 'category') {
        joinClause = `
          JOIN tour_category_assignments tca ON t.id = tca.tour_id
          JOIN tour_categories tc ON tca.category_id = tc.id
        `;
        whereClause = 'tc.slug = $1';
      } else if (type === 'destination') {
        joinClause = `
          JOIN tour_destinations td ON t.id = td.tour_id
          JOIN destinations d ON td.destination_id = d.id
        `;
        whereClause = 'd.slug = $1';
      } else {
        throw new Error('Type invalide. Utilisez "category" ou "destination"');
      }

      const query = `
        SELECT 
          COUNT(*) as total_tours,
          MIN(t.price_from) as min_price,
          MAX(t.price_from) as max_price,
          AVG(t.price_from) as avg_price,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.price_from) as median_price,
          -- Répartition par gamme de prix
          COUNT(*) FILTER (WHERE t.price_from < 100) as budget_count,
          COUNT(*) FILTER (WHERE t.price_from BETWEEN 100 AND 300) as mid_range_count,
          COUNT(*) FILTER (WHERE t.price_from > 300) as premium_count
        FROM tours t
        ${joinClause}
        WHERE t.is_active = true AND ${whereClause}
      `;

      const { rows: [stats] } = await pool.query(query, [identifier]);

      return {
        totalTours: parseInt(stats.total_tours || 0),
        minPrice: parseFloat(stats.min_price || 0),
        maxPrice: parseFloat(stats.max_price || 0),
        avgPrice: parseFloat(stats.avg_price || 0).toFixed(2),
        medianPrice: parseFloat(stats.median_price || 0).toFixed(2),
        priceDistribution: {
          budget: parseInt(stats.budget_count || 0),
          midRange: parseInt(stats.mid_range_count || 0),
          premium: parseInt(stats.premium_count || 0)
        }
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques de prix:', error);
      throw new Error('Impossible de calculer les statistiques de prix');
    }
  }

  /**
   * Récupère les tours similaires basés sur les catégories et destinations
   * @param {number} tourId - ID du tour de référence
   * @param {number} limit - Nombre de tours similaires à retourner
   * @returns {Array} Tours similaires
   */
  static async getSimilarTours(tourId, limit = 4) {
    try {
      const query = `
        SELECT * FROM get_similar_tours($1, $2)
      `;
      
      const { rows } = await pool.query(query, [tourId, limit]);
      
      return rows.map(tour => ({
        ...tour,
        avg_rating: parseFloat(tour.avg_rating || 0).toFixed(1),
        price_from: parseFloat(tour.price_from || 0)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des tours similaires:', error);
      throw new Error('Impossible de récupérer les tours similaires');
    }
  }

  /**
   * Récupère les recommandations populaires
   * @param {number} limit - Nombre de recommandations
   * @returns {Array} Tours recommandés
   */
  static async getPopularRecommendations(limit = 6) {
    try {
      const query = `
        SELECT * FROM get_popular_recommendations($1)
      `;
      
      const { rows } = await pool.query(query, [limit]);
      
      return rows.map(tour => ({
        ...tour,
        avg_rating: parseFloat(tour.avg_rating || 0).toFixed(1),
        price_from: parseFloat(tour.price_from || 0)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      throw new Error('Impossible de récupérer les recommandations');
    }
  }

  /**
   * Effectue une recherche de contenu avec la fonction optimisée
   * @param {string} searchTerm - Terme de recherche
   * @param {number} limit - Nombre de résultats
   * @returns {Array} Résultats de recherche
   */
  static async searchContent(searchTerm, limit = 10) {
    try {
      const query = `
        SELECT * FROM search_content($1, $2)
      `;
      
      const { rows } = await pool.query(query, [searchTerm, limit]);
      
      return rows.map(result => ({
        ...result,
        avg_rating: parseFloat(result.avg_rating || 0).toFixed(1),
        price_from: parseFloat(result.price_from || 0)
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche de contenu:', error);
      throw new Error('Impossible d\'effectuer la recherche');
    }
  }

  /**
   * Vérifie la disponibilité d'un tour pour une date donnée
   * @param {number} tourId - ID du tour
   * @param {string} date - Date au format YYYY-MM-DD
   * @returns {Object} Informations de disponibilité
   */
  static async checkAvailability(tourId, date) {
    try {
      const query = `
        SELECT check_tour_availability($1, $2) as availability
      `;
      
      const { rows: [result] } = await pool.query(query, [tourId, date]);
      
      return {
        available: result.availability,
        tourId,
        date,
        checkedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      throw new Error('Impossible de vérifier la disponibilité');
    }
  }

  /**
   * Calcule le prix pour un groupe
   * @param {number} tourId - ID du tour
   * @param {number} groupSize - Taille du groupe
   * @returns {Object} Détails du prix calculé
   */
  static async calculateGroupPrice(tourId, groupSize) {
    try {
      const query = `
        SELECT calculate_group_price($1, $2) as total_price
      `;
      
      const { rows: [result] } = await pool.query(query, [tourId, groupSize]);
      
      // Récupération des détails du tour pour le contexte
      const tourQuery = `
        SELECT name, price_from, group_size_max
        FROM tours 
        WHERE id = $1 AND is_active = true
      `;
      
      const { rows: [tour] } = await pool.query(tourQuery, [tourId]);
      
      if (!tour) {
        throw new Error('Tour non trouvé ou inactif');
      }

      return {
        tourId,
        tourName: tour.name,
        groupSize,
        maxGroupSize: tour.group_size_max,
        pricePerPerson: parseFloat(tour.price_from),
        totalPrice: parseFloat(result.total_price || 0),
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors du calcul du prix de groupe:', error);
      throw new Error('Impossible de calculer le prix de groupe');
    }
  }

  /**
   * Calcule le score de popularité d'un tour basé sur plusieurs métriques
   * @param {number} tourId - ID du tour
   * @returns {Promise<Object>} Score de popularité avec détails
   */
  static async calculatePopularityScore(tourId) {
    try {
      const query = `
        SELECT 
          t.id,
          t.name,
          t.price_from,
          t.rating_average,
          t.rating_count,
          t.views_count,
          t.created_at,
          COUNT(DISTINCT b.id) as total_bookings,
          COUNT(DISTINCT r.id) as total_reviews,
          AVG(r.rating) as avg_review_rating,
          SUM(CASE WHEN b.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as recent_bookings,
          SUM(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as recent_reviews
        FROM Tours t
        LEFT JOIN Bookings b ON t.id = b.tour_id AND b.status IN ('confirmed', 'completed')
        LEFT JOIN Reviews r ON t.id = r.tour_id AND r.status = 'approved'
        WHERE t.id = $1 AND t.status = 'active'
        GROUP BY t.id, t.name, t.price_from, t.rating_average, t.rating_count, t.views_count, t.created_at
      `;
      
      const { rows: [tour] } = await pool.query(query, [tourId]);
      
      if (!tour) {
        throw new Error('Tour non trouvé');
      }

      // Calcul du score de popularité (0-100)
      const bookingScore = Math.min((tour.total_bookings || 0) * 2, 30);
      const reviewScore = Math.min((tour.total_reviews || 0) * 1.5, 20);
      const ratingScore = ((tour.rating_average || 0) / 5) * 25;
      const viewScore = Math.min(((tour.views_count || 0) / 1000) * 10, 15);
      const recentActivityScore = Math.min(((tour.recent_bookings || 0) + (tour.recent_reviews || 0)) * 2, 10);
      
      const totalScore = Math.round(bookingScore + reviewScore + ratingScore + viewScore + recentActivityScore);

      return {
        tourId: tour.id,
        tourName: tour.name,
        popularityScore: totalScore,
        metrics: {
          totalBookings: tour.total_bookings || 0,
          totalReviews: tour.total_reviews || 0,
          averageRating: parseFloat(tour.rating_average || 0),
          viewsCount: tour.views_count || 0,
          recentBookings: tour.recent_bookings || 0,
          recentReviews: tour.recent_reviews || 0
        },
        scoreBreakdown: {
          bookings: bookingScore,
          reviews: reviewScore,
          rating: ratingScore,
          views: viewScore,
          recentActivity: recentActivityScore
        }
      };
    } catch (error) {
      console.error('Erreur lors du calcul du score de popularité:', error);
      throw new Error('Impossible de calculer le score de popularité');
    }
  }

  /**
   * Récupère les tours bestsellers avec calculs avancés
   * @param {number} limit - Nombre de tours à retourner
   * @returns {Promise<Array>} Liste des tours bestsellers
   */
  static async getBestsellers(limit = 6) {
    try {
      const query = `
        SELECT 
          t.id,
          t.name,
          t.slug,
          t.description_short,
          t.price_from,
          t.price_to,
          t.duration_days,
          t.duration_nights,
          t.difficulty_level,
          t.rating_average,
          t.rating_count,
          t.views_count,
          t.featured_image,
          t.gallery_images,
          t.created_at,
          d.name as destination_name,
          d.country,
          COUNT(DISTINCT b.id) as total_bookings,
          COUNT(DISTINCT r.id) as total_reviews,
          AVG(r.rating) as avg_review_rating,
          SUM(CASE WHEN b.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as recent_bookings,
          SUM(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as recent_reviews,
          -- Calcul du score de popularité directement en SQL
          (
            LEAST(COUNT(DISTINCT b.id) * 2, 30) +
            LEAST(COUNT(DISTINCT r.id) * 1.5, 20) +
            ((COALESCE(t.rating_average, 0) / 5) * 25) +
            LEAST((COALESCE(t.views_count, 0) / 1000) * 10, 15) +
            LEAST((SUM(CASE WHEN b.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) + 
                   SUM(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END)) * 2, 10)
          ) as popularity_score
        FROM Tours t
        LEFT JOIN Destinations d ON t.destination_id = d.id
        LEFT JOIN Bookings b ON t.id = b.tour_id AND b.status IN ('confirmed', 'completed')
        LEFT JOIN Reviews r ON t.id = r.tour_id AND r.status = 'approved'
        WHERE t.status = 'active' AND t.is_published = true
        GROUP BY t.id, t.name, t.slug, t.description_short, t.price_from, t.price_to, 
                 t.duration_days, t.duration_nights, t.difficulty_level, t.rating_average, 
                 t.rating_count, t.views_count, t.featured_image, t.gallery_images, 
                 t.created_at, d.name, d.country
        ORDER BY popularity_score DESC, total_bookings DESC, t.rating_average DESC
        LIMIT $1
      `;
      
      const { rows } = await pool.query(query, [limit]);
      
      return rows.map(tour => ({
        id: tour.id,
        name: tour.name,
        slug: tour.slug,
        shortDescription: tour.description_short,
        priceFrom: parseFloat(tour.price_from),
        priceTo: tour.price_to ? parseFloat(tour.price_to) : null,
        duration: {
          days: tour.duration_days,
          nights: tour.duration_nights
        },
        difficulty: tour.difficulty_level,
        rating: {
          average: parseFloat(tour.rating_average || 0),
          count: tour.rating_count || 0
        },
        destination: {
          name: tour.destination_name,
          country: tour.country
        },
        images: {
          featured: tour.featured_image,
          gallery: tour.gallery_images ? JSON.parse(tour.gallery_images) : []
        },
        stats: {
          totalBookings: tour.total_bookings || 0,
          totalReviews: tour.total_reviews || 0,
          viewsCount: tour.views_count || 0,
          recentBookings: tour.recent_bookings || 0,
          recentReviews: tour.recent_reviews || 0,
          popularityScore: Math.round(parseFloat(tour.popularity_score || 0))
        },
        badges: this._generateTourBadges(tour)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des bestsellers:', error);
      throw new Error('Impossible de récupérer les tours bestsellers');
    }
  }

  /**
   * Calcule les prix dynamiques basés sur la demande et la saisonnalité
   * @param {number} tourId - ID du tour
   * @param {string} startDate - Date de début (YYYY-MM-DD)
   * @param {number} groupSize - Taille du groupe
   * @returns {Promise<Object>} Prix calculé avec détails
   */
  static async calculateDynamicPricing(tourId, startDate, groupSize = 1) {
    try {
      // Récupération des données de base du tour
      const tourQuery = `
        SELECT 
          t.id, t.name, t.price_from, t.price_to, t.group_size_max,
          t.seasonal_pricing, t.dynamic_pricing_enabled,
          COUNT(DISTINCT b.id) as total_bookings_period
        FROM Tours t
        LEFT JOIN Bookings b ON t.id = b.tour_id 
          AND b.start_date BETWEEN $2::date - INTERVAL '30 days' AND $2::date + INTERVAL '30 days'
          AND b.status IN ('confirmed', 'completed')
        WHERE t.id = $1 AND t.status = 'active'
        GROUP BY t.id, t.name, t.price_from, t.price_to, t.group_size_max, 
                 t.seasonal_pricing, t.dynamic_pricing_enabled
      `;
      
      const { rows: [tour] } = await pool.query(tourQuery, [tourId, startDate]);
      
      if (!tour) {
        throw new Error('Tour non trouvé ou inactif');
      }

      let basePrice = parseFloat(tour.price_from);
      let finalPrice = basePrice;
      const adjustments = [];

      // Ajustement saisonnier
      if (tour.seasonal_pricing) {
        const seasonalData = JSON.parse(tour.seasonal_pricing);
        const month = new Date(startDate).getMonth() + 1;
        const seasonalMultiplier = seasonalData[month] || 1;
        
        if (seasonalMultiplier !== 1) {
          const seasonalAdjustment = basePrice * (seasonalMultiplier - 1);
          finalPrice += seasonalAdjustment;
          adjustments.push({
            type: 'seasonal',
            description: `Ajustement saisonnier (${seasonalMultiplier}x)`,
            amount: seasonalAdjustment,
            percentage: ((seasonalMultiplier - 1) * 100).toFixed(1)
          });
        }
      }

      // Ajustement basé sur la demande
      if (tour.dynamic_pricing_enabled && tour.total_bookings_period > 0) {
        const demandMultiplier = Math.min(1 + (tour.total_bookings_period * 0.05), 1.5);
        
        if (demandMultiplier > 1) {
          const demandAdjustment = basePrice * (demandMultiplier - 1);
          finalPrice += demandAdjustment;
          adjustments.push({
            type: 'demand',
            description: `Forte demande (${tour.total_bookings_period} réservations récentes)`,
            amount: demandAdjustment,
            percentage: ((demandMultiplier - 1) * 100).toFixed(1)
          });
        }
      }

      // Ajustement pour la taille du groupe
      if (groupSize > 1) {
        const groupDiscount = Math.min(groupSize * 0.02, 0.15); // Max 15% de réduction
        const groupAdjustment = -finalPrice * groupDiscount;
        finalPrice += groupAdjustment;
        adjustments.push({
          type: 'group_discount',
          description: `Réduction groupe (${groupSize} personnes)`,
          amount: groupAdjustment,
          percentage: (-groupDiscount * 100).toFixed(1)
        });
      }

      const totalPrice = finalPrice * groupSize;

      return {
        tourId,
        tourName: tour.name,
        startDate,
        groupSize,
        pricing: {
          basePrice,
          pricePerPerson: Math.round(finalPrice * 100) / 100,
          totalPrice: Math.round(totalPrice * 100) / 100,
          currency: 'EUR'
        },
        adjustments,
        savings: basePrice > finalPrice ? {
          amount: Math.round((basePrice - finalPrice) * groupSize * 100) / 100,
          percentage: (((basePrice - finalPrice) / basePrice) * 100).toFixed(1)
        } : null,
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors du calcul des prix dynamiques:', error);
      throw new Error('Impossible de calculer les prix dynamiques');
    }
  }

  /**
   * Génère des badges pour un tour basé sur ses statistiques
   * @param {Object} tour - Données du tour
   * @returns {Array} Liste des badges
   * @private
   */
  static _generateTourBadges(tour) {
    const badges = [];
    
    // Badge bestseller
    if (tour.total_bookings >= 50) {
      badges.push({ type: 'bestseller', label: 'Bestseller', color: 'gold' });
    }
    
    // Badge haute qualité
    if (tour.rating_average >= 4.5 && tour.rating_count >= 10) {
      badges.push({ type: 'high_rated', label: 'Très bien noté', color: 'green' });
    }
    
    // Badge nouveau
    const daysSinceCreation = (new Date() - new Date(tour.created_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 30) {
      badges.push({ type: 'new', label: 'Nouveau', color: 'blue' });
    }
    
    // Badge populaire récemment
    if (tour.recent_bookings >= 5) {
      badges.push({ type: 'trending', label: 'Tendance', color: 'orange' });
    }
    
    return badges;
  }
}

module.exports = TourService;