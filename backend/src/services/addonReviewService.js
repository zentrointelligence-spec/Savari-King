const pool = require('../db');

/**
 * Service pour la gestion des avis d'addons
 * Permet aux utilisateurs de noter et commenter les addons après leur voyage
 */

class AddonReviewService {
  /**
   * Vérifie si un utilisateur peut laisser un avis pour un addon
   * Conditions: doit avoir une réservation complétée avec cet addon et la date de voyage passée
   */
  async canUserReviewAddon(userId, addonId, bookingId) {
    try {
      const query = `
        SELECT
          b.id,
          b.user_id,
          b.tour_id,
          b.travel_date,
          b.status,
          b.selected_addons,
          EXISTS (
            SELECT 1 FROM addon_reviews ar
            WHERE ar.booking_id = b.id AND ar.addon_id = $2
          ) as already_reviewed
        FROM bookings b
        WHERE b.id = $1
          AND b.user_id = $3
          AND b.status IN ('Confirmed', 'Completed')
          AND b.travel_date < CURRENT_DATE
          AND b.selected_addons IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(b.selected_addons) AS addon
            WHERE (addon->>'id')::INTEGER = $2
          )
      `;

      const result = await pool.query(query, [bookingId, addonId, userId]);

      if (result.rows.length === 0) {
        return {
          canReview: false,
          reason: 'NO_ELIGIBLE_BOOKING'
        };
      }

      const booking = result.rows[0];

      if (booking.already_reviewed) {
        return {
          canReview: false,
          reason: 'ALREADY_REVIEWED'
        };
      }

      return {
        canReview: true,
        booking: booking
      };
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les réservations éligibles pour laisser des avis d'addons
   */
  async getEligibleBookingsForReviews(userId) {
    try {
      const query = `
        SELECT DISTINCT
          b.id as booking_id,
          b.tour_id,
          b.travel_date,
          t.name as tour_name,
          t.main_image_url,
          a.id as addon_id,
          a.name as addon_name,
          a.category as addon_category,
          a.icon as addon_icon,
          EXISTS (
            SELECT 1 FROM addon_reviews ar
            WHERE ar.booking_id = b.id AND ar.addon_id = a.id
          ) as already_reviewed
        FROM bookings b
        INNER JOIN tours t ON b.tour_id = t.id
        CROSS JOIN LATERAL (
          SELECT (elem->>'id')::INTEGER as addon_id
          FROM jsonb_array_elements(b.selected_addons) AS elem
        ) booking_addons
        INNER JOIN addons a ON a.id = booking_addons.addon_id
        WHERE b.user_id = $1
          AND b.status IN ('Confirmed', 'Completed')
          AND b.travel_date < CURRENT_DATE
          AND b.selected_addons IS NOT NULL
        ORDER BY b.travel_date DESC, a.name ASC
      `;

      const result = await pool.query(query, [userId]);

      // Grouper par booking
      const bookingsMap = new Map();

      result.rows.forEach(row => {
        if (!bookingsMap.has(row.booking_id)) {
          bookingsMap.set(row.booking_id, {
            booking_id: row.booking_id,
            tour_id: row.tour_id,
            tour_name: row.tour_name,
            tour_image: row.main_image_url,
            travel_date: row.travel_date,
            addons: []
          });
        }

        bookingsMap.get(row.booking_id).addons.push({
          addon_id: row.addon_id,
          addon_name: row.addon_name,
          addon_category: row.addon_category,
          addon_icon: row.addon_icon,
          already_reviewed: row.already_reviewed
        });
      });

      return Array.from(bookingsMap.values());
    } catch (error) {
      console.error('Error fetching eligible bookings:', error);
      throw error;
    }
  }

  /**
   * Crée un nouvel avis pour un addon
   */
  async createAddonReview(reviewData) {
    const { userId, addonId, bookingId, rating, comment } = reviewData;

    try {
      // Vérifier l'éligibilité
      const eligibility = await this.canUserReviewAddon(userId, addonId, bookingId);

      if (!eligibility.canReview) {
        throw new Error(`Cannot review: ${eligibility.reason}`);
      }

      // Insérer l'avis
      const insertQuery = `
        INSERT INTO addon_reviews (
          addon_id,
          booking_id,
          user_id,
          rating,
          comment
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        addonId,
        bookingId,
        userId,
        rating,
        comment || null
      ]);

      // Le trigger met automatiquement à jour les métriques de l'addon

      return {
        success: true,
        review: result.rows[0]
      };
    } catch (error) {
      console.error('Error creating addon review:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les avis pour un addon spécifique
   */
  async getAddonReviews(addonId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'newest'
    } = options;

    const offset = (page - 1) * limit;

    try {
      // Déterminer l'ordre de tri
      let orderClause = 'ar.created_at DESC';
      if (sortBy === 'oldest') orderClause = 'ar.created_at ASC';
      else if (sortBy === 'highest') orderClause = 'ar.rating DESC, ar.created_at DESC';
      else if (sortBy === 'lowest') orderClause = 'ar.rating ASC, ar.created_at DESC';

      const query = `
        SELECT
          ar.id,
          ar.addon_id,
          ar.booking_id,
          ar.user_id,
          ar.rating,
          ar.comment,
          ar.created_at,
          u.full_name,
          u.email,
          b.tour_id,
          b.travel_date,
          t.name as tour_name
        FROM addon_reviews ar
        INNER JOIN users u ON ar.user_id = u.id
        INNER JOIN bookings b ON ar.booking_id = b.id
        INNER JOIN tours t ON b.tour_id = t.id
        WHERE ar.addon_id = $1
        ORDER BY ${orderClause}
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM addon_reviews
        WHERE addon_id = $1
      `;

      const [reviewsResult, countResult] = await Promise.all([
        pool.query(query, [addonId, limit, offset]),
        pool.query(countQuery, [addonId])
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        reviews: reviewsResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching addon reviews:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'avis pour un addon
   */
  async getAddonReviewStatistics(addonId) {
    try {
      const query = `
        SELECT
          a.id,
          a.name,
          a.rating as current_rating,
          a.popularity,
          COUNT(ar.id) as total_reviews,
          AVG(ar.rating)::NUMERIC(3,2) as average_rating,
          COUNT(CASE WHEN ar.rating = 5 THEN 1 END) as five_star,
          COUNT(CASE WHEN ar.rating = 4 THEN 1 END) as four_star,
          COUNT(CASE WHEN ar.rating = 3 THEN 1 END) as three_star,
          COUNT(CASE WHEN ar.rating = 2 THEN 1 END) as two_star,
          COUNT(CASE WHEN ar.rating = 1 THEN 1 END) as one_star
        FROM addons a
        LEFT JOIN addon_reviews ar ON a.id = ar.addon_id
        WHERE a.id = $1
        GROUP BY a.id, a.name, a.rating, a.popularity
      `;

      const result = await pool.query(query, [addonId]);

      if (result.rows.length === 0) {
        throw new Error('Addon not found');
      }

      const stats = result.rows[0];

      // Calculer les pourcentages
      const total = parseInt(stats.total_reviews);
      stats.rating_distribution = {
        5: { count: parseInt(stats.five_star), percentage: total > 0 ? Math.round((stats.five_star / total) * 100) : 0 },
        4: { count: parseInt(stats.four_star), percentage: total > 0 ? Math.round((stats.four_star / total) * 100) : 0 },
        3: { count: parseInt(stats.three_star), percentage: total > 0 ? Math.round((stats.three_star / total) * 100) : 0 },
        2: { count: parseInt(stats.two_star), percentage: total > 0 ? Math.round((stats.two_star / total) * 100) : 0 },
        1: { count: parseInt(stats.one_star), percentage: total > 0 ? Math.round((stats.one_star / total) * 100) : 0 }
      };

      // Nettoyer les champs temporaires
      delete stats.five_star;
      delete stats.four_star;
      delete stats.three_star;
      delete stats.two_star;
      delete stats.one_star;

      return stats;
    } catch (error) {
      console.error('Error fetching addon review statistics:', error);
      throw error;
    }
  }

  /**
   * Met à jour un avis existant
   */
  async updateAddonReview(reviewId, userId, updateData) {
    const { rating, comment } = updateData;

    try {
      // Vérifier que l'avis appartient à l'utilisateur
      const checkQuery = `
        SELECT id FROM addon_reviews
        WHERE id = $1 AND user_id = $2
      `;
      const checkResult = await pool.query(checkQuery, [reviewId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Review not found or unauthorized');
      }

      // Mettre à jour l'avis
      const updateQuery = `
        UPDATE addon_reviews
        SET
          rating = COALESCE($1, rating),
          comment = COALESCE($2, comment),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [rating, comment, reviewId]);

      return {
        success: true,
        review: result.rows[0]
      };
    } catch (error) {
      console.error('Error updating addon review:', error);
      throw error;
    }
  }

  /**
   * Supprime un avis
   */
  async deleteAddonReview(reviewId, userId) {
    try {
      const deleteQuery = `
        DELETE FROM addon_reviews
        WHERE id = $1 AND user_id = $2
        RETURNING addon_id
      `;

      const result = await pool.query(deleteQuery, [reviewId, userId]);

      if (result.rows.length === 0) {
        throw new Error('Review not found or unauthorized');
      }

      return {
        success: true,
        deleted: true
      };
    } catch (error) {
      console.error('Error deleting addon review:', error);
      throw error;
    }
  }

  /**
   * Récupère les avis d'un utilisateur
   */
  async getUserAddonReviews(userId) {
    try {
      const query = `
        SELECT
          ar.id,
          ar.addon_id,
          ar.rating,
          ar.comment,
          ar.created_at,
          ar.updated_at,
          a.name as addon_name,
          a.category as addon_category,
          a.icon as addon_icon,
          b.tour_id,
          b.travel_date,
          t.name as tour_name
        FROM addon_reviews ar
        INNER JOIN addons a ON ar.addon_id = a.id
        INNER JOIN bookings b ON ar.booking_id = b.id
        INNER JOIN tours t ON b.tour_id = t.id
        WHERE ar.user_id = $1
        ORDER BY ar.created_at DESC
      `;

      const result = await pool.query(query, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching user addon reviews:', error);
      throw error;
    }
  }
}

module.exports = new AddonReviewService();
