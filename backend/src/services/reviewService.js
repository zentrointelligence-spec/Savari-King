const pool = require('../db');

/**
 * Service pour la gestion des avis et évaluations
 * Inclut la sélection d'avis featured et les calculs de notes moyennes
 */
class ReviewService {
  /**
   * Récupère les avis featured pour la page d'accueil
   * @param {number} limit - Nombre d'avis à retourner
   * @returns {Array} Avis featured avec détails utilisateur et tour
   */
  static async getFeaturedReviews(limit = 6) {
    try {
      const query = `
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          r.helpful_count,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          u.country,
          t.id as tour_id,
          t.name as tour_name,
          t.slug as tour_slug,
          t.main_image_url as tour_image,
          -- Score de qualité de l'avis
          (r.rating * 0.3 + LENGTH(r.comment) * 0.002 + r.helpful_count * 0.1) as quality_score
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN tours t ON r.tour_id = t.id
        WHERE r.is_approved = true 
          AND r.is_featured = true
          AND r.rating >= 4
          AND LENGTH(r.comment) >= 50
          AND t.is_active = true
        ORDER BY quality_score DESC, r.created_at DESC
        LIMIT $1
      `;
      
      const { rows } = await pool.query(query, [limit]);
      
      return rows.map(review => ({
        id: review.id,
        rating: parseInt(review.rating),
        comment: review.comment,
        createdAt: review.created_at,
        helpfulCount: review.helpful_count || 0,
        user: {
          name: `${review.first_name} ${review.last_name}`,
          firstName: review.first_name,
          lastName: review.last_name,
          profileImage: review.profile_image_url,
          country: review.country
        },
        tour: {
          id: review.tour_id,
          name: review.tour_name,
          slug: review.tour_slug,
          image: review.tour_image
        },
        qualityScore: parseFloat(review.quality_score || 0).toFixed(2)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des avis featured:', error);
      throw new Error('Impossible de récupérer les avis featured');
    }
  }

  /**
   * Récupère les avis pour un tour spécifique avec pagination
   * @param {number} tourId - ID du tour
   * @param {Object} options - Options de pagination et tri
   * @returns {Object} Avis avec métadonnées de pagination
   */
  static async getReviewsByTour(tourId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'newest',
        minRating = 1
      } = options;

      const offset = (page - 1) * limit;
      
      // Définition du tri
      let orderBy = '';
      switch (sortBy) {
        case 'oldest':
          orderBy = 'ORDER BY r.submission_date ASC';
          break;
        case 'rating_high':
          orderBy = 'ORDER BY r.rating DESC, r.submission_date DESC';
          break;
        case 'rating_low':
          orderBy = 'ORDER BY r.rating ASC, r.submission_date DESC';
          break;
        case 'helpful':
          orderBy = 'ORDER BY r.helpful_count DESC, r.submission_date DESC';
          break;
        case 'newest':
        default:
          orderBy = 'ORDER BY r.submission_date DESC';
          break;
      }

      const query = `
        SELECT
          r.id,
          r.rating,
          r.review_text,
          r.submission_date,
          r.helpful_count,
          r.verified_purchase,
          r.response_from_admin,
          r.travel_date,
          u.full_name,
          u.profile_image_url,
          u.country
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.tour_id = $1
          AND r.is_approved = true
          AND r.rating >= $2
        ${orderBy}
        LIMIT $3 OFFSET $4
      `;

      // Requête pour le total et les statistiques
      const statsQuery = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as avg_rating,
          COUNT(*) FILTER (WHERE rating = 5) as five_star,
          COUNT(*) FILTER (WHERE rating = 4) as four_star,
          COUNT(*) FILTER (WHERE rating = 3) as three_star,
          COUNT(*) FILTER (WHERE rating = 2) as two_star,
          COUNT(*) FILTER (WHERE rating = 1) as one_star
        FROM reviews 
        WHERE tour_id = $1 
          AND is_approved = true
          AND rating >= $2
      `;

      const [reviewsResult, statsResult] = await Promise.all([
        pool.query(query, [tourId, minRating, limit, offset]),
        pool.query(statsQuery, [tourId, minRating])
      ]);

      const reviews = reviewsResult.rows.map(review => ({
        id: review.id,
        rating: parseInt(review.rating),
        review_text: review.review_text,
        created_at: review.submission_date,
        helpful_count: review.helpful_count || 0,
        verified_purchase: review.verified_purchase,
        response_from_admin: review.response_from_admin,
        travel_date: review.travel_date,
        full_name: review.full_name,
        profile_image_url: review.profile_image_url,
        country: review.country
      }));

      const stats = statsResult.rows[0];
      const total = parseInt(stats.total_reviews);
      const totalPages = Math.ceil(total / limit);

      return {
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        statistics: {
          totalReviews: total,
          avgRating: parseFloat(stats.avg_rating || 0).toFixed(1),
          ratingDistribution: {
            5: parseInt(stats.five_star || 0),
            4: parseInt(stats.four_star || 0),
            3: parseInt(stats.three_star || 0),
            2: parseInt(stats.two_star || 0),
            1: parseInt(stats.one_star || 0)
          }
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des avis du tour:', error);
      throw new Error('Impossible de récupérer les avis du tour');
    }
  }

  /**
   * Calcule les statistiques détaillées des avis pour un tour
   * @param {number} tourId - ID du tour
   * @returns {Object} Statistiques détaillées des avis
   */
  static async getReviewStatistics(tourId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as avg_rating,
          COUNT(*) FILTER (WHERE rating = 5) as five_star,
          COUNT(*) FILTER (WHERE rating = 4) as four_star,
          COUNT(*) FILTER (WHERE rating = 3) as three_star,
          COUNT(*) FILTER (WHERE rating = 2) as two_star,
          COUNT(*) FILTER (WHERE rating = 1) as one_star,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
          COUNT(*) FILTER (WHERE LENGTH(comment) > 100) as detailed_reviews,
          -- Calcul du taux de satisfaction (4-5 étoiles)
          COUNT(*) FILTER (WHERE rating >= 4) * 100.0 / COUNT(*) as satisfaction_rate,
          -- Moyenne des avis des 30 derniers jours
          AVG(rating) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_avg_rating,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_reviews_count
        FROM reviews 
        WHERE tour_id = $1 AND is_approved = true
      `;
      
      const { rows: [stats] } = await pool.query(query, [tourId]);
      
      const totalReviews = parseInt(stats.total_reviews || 0);
      
      return {
        totalReviews,
        avgRating: parseFloat(stats.avg_rating || 0).toFixed(1),
        satisfactionRate: parseFloat(stats.satisfaction_rate || 0).toFixed(1),
        featuredCount: parseInt(stats.featured_count || 0),
        detailedReviews: parseInt(stats.detailed_reviews || 0),
        ratingDistribution: {
          5: {
            count: parseInt(stats.five_star || 0),
            percentage: totalReviews > 0 ? ((parseInt(stats.five_star || 0) / totalReviews) * 100).toFixed(1) : '0.0'
          },
          4: {
            count: parseInt(stats.four_star || 0),
            percentage: totalReviews > 0 ? ((parseInt(stats.four_star || 0) / totalReviews) * 100).toFixed(1) : '0.0'
          },
          3: {
            count: parseInt(stats.three_star || 0),
            percentage: totalReviews > 0 ? ((parseInt(stats.three_star || 0) / totalReviews) * 100).toFixed(1) : '0.0'
          },
          2: {
            count: parseInt(stats.two_star || 0),
            percentage: totalReviews > 0 ? ((parseInt(stats.two_star || 0) / totalReviews) * 100).toFixed(1) : '0.0'
          },
          1: {
            count: parseInt(stats.one_star || 0),
            percentage: totalReviews > 0 ? ((parseInt(stats.one_star || 0) / totalReviews) * 100).toFixed(1) : '0.0'
          }
        },
        recentTrend: {
          avgRating: parseFloat(stats.recent_avg_rating || 0).toFixed(1),
          reviewsCount: parseInt(stats.recent_reviews_count || 0)
        }
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques d\'avis:', error);
      throw new Error('Impossible de calculer les statistiques d\'avis');
    }
  }

  /**
   * Récupère les avis les plus utiles (avec le plus de votes "helpful")
   * @param {number} limit - Nombre d'avis à retourner
   * @returns {Array} Avis les plus utiles
   */
  static async getMostHelpfulReviews(limit = 10) {
    try {
      const query = `
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          r.helpful_count,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          t.id as tour_id,
          t.name as tour_name,
          t.slug as tour_slug
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN tours t ON r.tour_id = t.id
        WHERE r.is_approved = true 
          AND r.helpful_count > 0
          AND LENGTH(r.comment) >= 50
          AND t.is_active = true
        ORDER BY r.helpful_count DESC, r.created_at DESC
        LIMIT $1
      `;
      
      const { rows } = await pool.query(query, [limit]);
      
      return rows.map(review => ({
        id: review.id,
        rating: parseInt(review.rating),
        comment: review.comment,
        createdAt: review.created_at,
        helpfulCount: review.helpful_count,
        user: {
          name: `${review.first_name} ${review.last_name}`,
          firstName: review.first_name,
          lastName: review.last_name,
          profileImage: review.profile_image_url
        },
        tour: {
          id: review.tour_id,
          name: review.tour_name,
          slug: review.tour_slug
        }
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des avis les plus utiles:', error);
      throw new Error('Impossible de récupérer les avis les plus utiles');
    }
  }

  /**
   * Récupère les statistiques globales des avis
   * @returns {Object} Statistiques globales
   */
  static async getGlobalReviewStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as avg_rating,
          COUNT(DISTINCT tour_id) as tours_with_reviews,
          COUNT(DISTINCT user_id) as users_who_reviewed,
          COUNT(*) FILTER (WHERE rating >= 4) as positive_reviews,
          COUNT(*) FILTER (WHERE rating <= 2) as negative_reviews,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_reviews,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_reviews
        FROM reviews 
        WHERE is_approved = true
      `;

      const { rows: [stats] } = await pool.query(query);

      return {
        totalReviews: parseInt(stats.total_reviews),
        avgRating: parseFloat(stats.avg_rating || 0).toFixed(1),
        toursWithReviews: parseInt(stats.tours_with_reviews),
        usersWhoReviewed: parseInt(stats.users_who_reviewed),
        positiveReviews: parseInt(stats.positive_reviews),
        negativeReviews: parseInt(stats.negative_reviews),
        featuredReviews: parseInt(stats.featured_reviews),
        recentReviews: parseInt(stats.recent_reviews)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales:', error);
      throw new Error('Impossible de récupérer les statistiques globales des avis');
    }
  }

  /**
   * Calcule le score de qualité d'un avis basé sur plusieurs critères
   * @param {Object} review - Données de l'avis
   * @returns {number} Score de qualité (0-100)
   */
  static calculateReviewQualityScore(review) {
    let score = 0;
    
    // Score basé sur la note (0-25 points)
    score += (review.rating / 5) * 25;
    
    // Score basé sur la longueur du commentaire (0-20 points)
    const commentLength = review.comment ? review.comment.length : 0;
    if (commentLength >= 100) score += 20;
    else if (commentLength >= 50) score += 15;
    else if (commentLength >= 20) score += 10;
    else if (commentLength >= 10) score += 5;
    
    // Score basé sur l'utilité (0-20 points)
    const helpfulCount = review.helpful_count || 0;
    score += Math.min(helpfulCount * 2, 20);
    
    // Bonus pour achat vérifié (0-15 points)
    if (review.is_verified_booking) score += 15;
    
    // Bonus pour avis featured (0-10 points)
    if (review.is_featured) score += 10;
    
    // Bonus pour récence (0-10 points)
    const daysSinceCreation = (new Date() - new Date(review.created_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 7) score += 10;
    else if (daysSinceCreation <= 30) score += 5;
    
    return Math.round(Math.min(score, 100));
  }

  /**
   * Sélectionne automatiquement les meilleurs avis pour être featured
   * @param {number} tourId - ID du tour (optionnel, pour un tour spécifique)
   * @param {number} limit - Nombre d'avis à sélectionner
   * @returns {Promise<Array>} Liste des avis sélectionnés
   */
  static async selectFeaturedReviews(tourId = null, limit = 10) {
    try {
      let whereClause = 'WHERE r.is_approved = true AND r.rating >= 4';
      let queryParams = [limit];
      
      if (tourId) {
        whereClause += ' AND r.tour_id = $2';
        queryParams = [limit, tourId];
      }
      
      const query = `
        SELECT 
          r.id,
          r.tour_id,
          r.rating,
          r.comment,
          r.created_at,
          r.helpful_count,
          r.is_featured,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          u.country,
          t.name as tour_name,
          -- Vérification si l'utilisateur a réellement fait le tour
          EXISTS(
            SELECT 1 FROM bookings b 
            WHERE b.user_id = u.id 
              AND b.tour_id = r.tour_id 
              AND b.status = 'confirmed'
              AND b.tour_date < r.created_at
          ) as is_verified_booking,
          -- Calcul du score de qualité directement en SQL
          (
            (r.rating::float / 5 * 25) +
            CASE 
              WHEN LENGTH(r.comment) >= 100 THEN 20
              WHEN LENGTH(r.comment) >= 50 THEN 15
              WHEN LENGTH(r.comment) >= 20 THEN 10
              WHEN LENGTH(r.comment) >= 10 THEN 5
              ELSE 0
            END +
            LEAST(COALESCE(r.helpful_count, 0) * 2, 20) +
            CASE WHEN EXISTS(
              SELECT 1 FROM bookings b 
              WHERE b.user_id = u.id 
                AND b.tour_id = r.tour_id 
                AND b.status = 'confirmed'
                AND b.tour_date < r.created_at
            ) THEN 15 ELSE 0 END +
            CASE WHEN r.is_featured THEN 10 ELSE 0 END +
            CASE 
              WHEN r.created_at >= NOW() - INTERVAL '7 days' THEN 10
              WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 5
              ELSE 0
            END
          ) as quality_score
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN tours t ON r.tour_id = t.id
        ${whereClause}
        ORDER BY quality_score DESC, r.helpful_count DESC, r.created_at DESC
        LIMIT $1
      `;
      
      const { rows } = await pool.query(query, queryParams);
      
      return rows.map(review => ({
        id: review.id,
        tourId: review.tour_id,
        tourName: review.tour_name,
        rating: parseInt(review.rating),
        comment: review.comment,
        createdAt: review.created_at,
        helpfulCount: review.helpful_count || 0,
        isFeatured: review.is_featured,
        isVerifiedBooking: review.is_verified_booking,
        qualityScore: Math.round(parseFloat(review.quality_score || 0)),
        user: {
          name: `${review.first_name} ${review.last_name}`,
          firstName: review.first_name,
          lastName: review.last_name,
          profileImage: review.profile_image_url,
          country: review.country
        }
      }));
    } catch (error) {
      console.error('Erreur lors de la sélection des avis featured:', error);
      throw new Error('Impossible de sélectionner les avis featured');
    }
  }

  /**
   * Analyse les sentiments et tendances des avis
   * @param {number} tourId - ID du tour
   * @param {number} days - Période d'analyse en jours (défaut: 90)
   * @returns {Promise<Object>} Analyse des sentiments et tendances
   */
  static async analyzeSentimentTrends(tourId, days = 90) {
    try {
      const query = `
        WITH review_trends AS (
          SELECT 
            DATE_TRUNC('week', created_at) as week,
            AVG(rating) as avg_rating,
            COUNT(*) as review_count,
            COUNT(*) FILTER (WHERE rating >= 4) as positive_count,
            COUNT(*) FILTER (WHERE rating <= 2) as negative_count
          FROM reviews 
          WHERE tour_id = $1 
            AND is_approved = true 
            AND created_at >= NOW() - INTERVAL '${days} days'
          GROUP BY DATE_TRUNC('week', created_at)
          ORDER BY week DESC
        ),
        keyword_analysis AS (
          SELECT 
            LOWER(word) as keyword,
            COUNT(*) as frequency,
            AVG(rating) as avg_rating_for_keyword
          FROM reviews r,
          LATERAL unnest(string_to_array(LOWER(regexp_replace(r.comment, '[^a-zA-Z\\s]', '', 'g')), ' ')) as word
          WHERE r.tour_id = $1 
            AND r.is_approved = true 
            AND r.created_at >= NOW() - INTERVAL '${days} days'
            AND LENGTH(word) > 3
          GROUP BY LOWER(word)
          HAVING COUNT(*) >= 2
          ORDER BY frequency DESC
          LIMIT 20
        )
        SELECT 
          json_agg(rt.*) as trends,
          (
            SELECT json_agg(ka.*) 
            FROM keyword_analysis ka
          ) as keywords
        FROM review_trends rt
      `;
      
      const { rows: [result] } = await pool.query(query, [tourId]);
      
      // Calcul des métriques de sentiment
      const trends = result.trends || [];
      const keywords = result.keywords || [];
      
      let overallSentiment = 'neutral';
      let sentimentScore = 0;
      
      if (trends.length > 0) {
        const recentAvgRating = trends.slice(0, 4).reduce((sum, t) => sum + parseFloat(t.avg_rating), 0) / Math.min(4, trends.length);
        sentimentScore = (recentAvgRating / 5) * 100;
        
        if (recentAvgRating >= 4.0) overallSentiment = 'positive';
        else if (recentAvgRating <= 2.5) overallSentiment = 'negative';
      }
      
      return {
        tourId,
        analysisDate: new Date().toISOString(),
        period: `${days} jours`,
        sentiment: {
          overall: overallSentiment,
          score: Math.round(sentimentScore),
          description: this._getSentimentDescription(overallSentiment, sentimentScore)
        },
        trends: trends.map(trend => ({
          week: trend.week,
          avgRating: parseFloat(trend.avg_rating).toFixed(1),
          reviewCount: parseInt(trend.review_count),
          positiveCount: parseInt(trend.positive_count),
          negativeCount: parseInt(trend.negative_count),
          positiveRatio: ((parseInt(trend.positive_count) / parseInt(trend.review_count)) * 100).toFixed(1)
        })),
        keywords: keywords.map(kw => ({
          keyword: kw.keyword,
          frequency: parseInt(kw.frequency),
          avgRating: parseFloat(kw.avg_rating_for_keyword).toFixed(1),
          sentiment: parseFloat(kw.avg_rating_for_keyword) >= 4 ? 'positive' : 
                    parseFloat(kw.avg_rating_for_keyword) <= 2.5 ? 'negative' : 'neutral'
        }))
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse des sentiments:', error);
      throw new Error('Impossible d\'analyser les sentiments des avis');
    }
  }

  /**
   * Génère une description textuelle du sentiment
   * @param {string} sentiment - Sentiment global
   * @param {number} score - Score de sentiment
   * @returns {string} Description du sentiment
   * @private
   */
  static _getSentimentDescription(sentiment, score) {
    if (sentiment === 'positive') {
      if (score >= 90) return 'Excellente satisfaction client';
      if (score >= 80) return 'Très bonne satisfaction client';
      return 'Bonne satisfaction client';
    } else if (sentiment === 'negative') {
      if (score <= 30) return 'Satisfaction client très faible';
      if (score <= 50) return 'Satisfaction client faible';
      return 'Satisfaction client mitigée';
    }
    return 'Satisfaction client neutre';
  }

  /**
   * Get global recommendation statistics across all tours
   * Option B: Calculate based on ratings (4+ stars = would recommend)
   * @returns {Object} Recommendation statistics
   */
  static async getGlobalRecommendationStats() {
    try {
      const query = `
        SELECT
          COUNT(*) as total_reviews,
          COUNT(CASE WHEN would_recommend = true THEN 1 END) as would_recommend_count,
          COUNT(CASE WHEN would_recommend = false THEN 1 END) as would_not_recommend_count,
          COUNT(CASE WHEN would_recommend IS NULL THEN 1 END) as neutral_count,
          ROUND(
            (COUNT(CASE WHEN would_recommend = true THEN 1 END)::DECIMAL /
             NULLIF(COUNT(*), 0) * 100),
            1
          ) as recommendation_percentage,
          ROUND(AVG(rating), 2) as average_rating,
          COUNT(CASE WHEN rating >= 4 THEN 1 END) as high_ratings_count,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count
        FROM reviews
        WHERE is_approved = true
      `;

      const { rows } = await pool.query(query);
      const stats = rows[0];

      return {
        totalReviews: parseInt(stats.total_reviews),
        wouldRecommend: parseInt(stats.would_recommend_count),
        wouldNotRecommend: parseInt(stats.would_not_recommend_count),
        neutral: parseInt(stats.neutral_count),
        recommendationPercentage: parseFloat(stats.recommendation_percentage) || 0,
        averageRating: parseFloat(stats.average_rating) || 0,
        highRatingsCount: parseInt(stats.high_ratings_count),
        fiveStarCount: parseInt(stats.five_star_count),
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching global recommendation stats:', error);
      throw new Error('Unable to fetch recommendation statistics');
    }
  }

  /**
   * Get recommendation statistics for a specific tour
   * @param {number} tourId - ID of the tour
   * @returns {Object} Tour-specific recommendation statistics
   */
  static async getTourRecommendationStats(tourId) {
    try {
      const query = `
        SELECT
          t.id,
          t.name,
          t.slug,
          COUNT(r.id) as total_reviews,
          COUNT(CASE WHEN r.would_recommend = true THEN 1 END) as would_recommend_count,
          COUNT(CASE WHEN r.would_recommend = false THEN 1 END) as would_not_recommend_count,
          ROUND(
            (COUNT(CASE WHEN r.would_recommend = true THEN 1 END)::DECIMAL /
             NULLIF(COUNT(r.id), 0) * 100),
            1
          ) as recommendation_percentage,
          ROUND(AVG(r.rating), 2) as average_rating
        FROM tours t
        LEFT JOIN reviews r ON t.id = r.tour_id AND r.is_approved = true
        WHERE t.id = $1
        GROUP BY t.id, t.name, t.slug
      `;

      const { rows } = await pool.query(query, [tourId]);

      if (rows.length === 0) {
        throw new Error('Tour not found');
      }

      const stats = rows[0];

      return {
        tourId: parseInt(stats.id),
        tourName: stats.name,
        tourSlug: stats.slug,
        totalReviews: parseInt(stats.total_reviews),
        wouldRecommend: parseInt(stats.would_recommend_count),
        wouldNotRecommend: parseInt(stats.would_not_recommend_count),
        recommendationPercentage: parseFloat(stats.recommendation_percentage) || 0,
        averageRating: parseFloat(stats.average_rating) || 0
      };
    } catch (error) {
      console.error('Error fetching tour recommendation stats:', error);
      throw error;
    }
  }
}

module.exports = ReviewService;