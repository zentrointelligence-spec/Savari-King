const db = require("../db");

exports.getAnalyticsData = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculer la date de début basée sur timeRange
    const getDateFilter = (range) => {
      const now = new Date();
      switch (range) {
        case '24h':
          return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case '7d':
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case '90d':
          return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        default:
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    };
    
    const startDate = getDateFilter(timeRange);
    
    // Exécuter toutes les requêtes en parallèle pour une performance maximale
    // Déterminer le niveau de troncature basé sur timeRange
    let truncLevel;
    let seriesInterval;

    switch (timeRange) {
      case '24h':
        truncLevel = 'hour';
        seriesInterval = '1 hour';
        break;
      case '7d':
        truncLevel = 'day';
        seriesInterval = '1 day';
        break;
      case '30d':
        truncLevel = 'day';
        seriesInterval = '1 day';
        break;
      case '90d':
        truncLevel = 'week';
        seriesInterval = '1 week';
        break;
      default:
        truncLevel = 'day';
        seriesInterval = '1 day';
    }

    const [
      revenueResult,
      bookingStatsResult,
      popularToursResult,
      revenueTrendResult,
      tourViewsResult,
      favoritesResult,
      conversionResult,
      userActivityResult,
      galleryStatsResult,
      recentActivityResult
    ] = await Promise.all([
      // 1. Revenus totaux - Utilise bookings.final_price au lieu de payments
      db.query(
        "SELECT SUM(final_price) as total_revenue FROM bookings WHERE status = 'Payment Confirmed' AND created_at >= $1",
        [startDate]
      ),
      // 2. Statistiques sur les réservations
      db.query(
        "SELECT COUNT(*) as total_bookings, AVG(final_price) as average_booking_value FROM bookings WHERE status = 'Payment Confirmed' AND created_at >= $1",
        [startDate]
      ),
      // 3. Tours les plus populaires
      db.query(`
        SELECT t.name, COUNT(b.id) as booking_count, t.id as tour_id
        FROM bookings b
        JOIN tours t ON b.tour_id = t.id
        WHERE b.created_at >= $1
        GROUP BY t.name, t.id
        ORDER BY booking_count DESC
        LIMIT 5
      `, [startDate]),
      // 4. Tendance des revenus avec série temporelle complète - Utilise bookings au lieu de payments
      db.query(`
        WITH date_series AS (
          SELECT date_trunc('${truncLevel}', generate_series(
            $1::timestamp,
            NOW(),
            INTERVAL '${seriesInterval}'
          )) as date
        )
        SELECT
          ds.date,
          COALESCE(SUM(b.final_price), 0) as revenue,
          COUNT(b.id) as transactions
        FROM date_series ds
        LEFT JOIN bookings b ON date_trunc('${truncLevel}', b.created_at) = ds.date
          AND b.status = 'Payment Confirmed'
        GROUP BY ds.date
        ORDER BY ds.date ASC
      `, [startDate]),
      // 5. Vues de tours (simulation - à remplacer par vraies données)
      db.query(`
        SELECT t.name, t.id,
          COALESCE(t.view_count, 0) + (RANDOM() * 100)::INT as views,
          COALESCE(t.view_count, 0) as base_views
        FROM tours t
        WHERE t.is_active = true
        ORDER BY views DESC
        LIMIT 10
      `),
      // 6. Statistiques des favoris (simulation)
      db.query(`
        SELECT COUNT(*) as total_favorites,
          COUNT(DISTINCT user_id) as users_with_favorites
        FROM user_favorites uf
        WHERE uf.created_at >= $1
      `, [startDate]),
      // 7. Analytics de conversion (vues → réservations)
      db.query(`
        SELECT
          COUNT(DISTINCT b.tour_id) as tours_with_bookings,
          COUNT(b.id) as total_bookings,
          AVG(CASE WHEN b.status = 'Payment Confirmed' THEN 1 ELSE 0 END) as conversion_rate
        FROM bookings b
        WHERE b.created_at >= $1
      `, [startDate]),
      // 8. Activité utilisateur
      db.query(`
        SELECT
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN u.last_login >= $1 THEN u.id END) as active_users,
          COUNT(DISTINCT CASE WHEN u.creation_date >= $1 THEN u.id END) as new_users
        FROM users u
      `, [startDate]),
      // 9. Statistiques de la galerie
      db.query(`
        SELECT
          COUNT(*) as total_images,
          COUNT(CASE WHEN created_at >= $1 THEN 1 END) as recent_uploads,
          SUM(COALESCE(views, 0)) as total_views
        FROM gallery_images
      `, [startDate]),
      // 10. Activité récente
      db.query(`
        SELECT 'booking' as type, 'Nouvelle réservation' as message, created_at as timestamp
        FROM bookings
        WHERE created_at >= $1
        ORDER BY created_at DESC
        LIMIT 5
      `, [startDate])
    ]);

    // Formatage des données pour le frontend (format compatible avec AdminAnalyticsPage)
    const analytics = {
      // Données attendues par le frontend
      total_revenue: parseFloat(revenueResult.rows[0]?.total_revenue) || 0,
      total_bookings: parseInt(bookingStatsResult.rows[0]?.total_bookings) || 0,
      average_booking_value: parseFloat(bookingStatsResult.rows[0]?.average_booking_value) || 0,

      // Tendance des revenus - format pour recharts LineChart avec labels adaptés au timeRange
      revenue_trend: revenueTrendResult.rows.map((row) => {
        let label;
        const date = new Date(row.date);

        switch (truncLevel) {
          case 'hour':
            // Format: "14:00" ou "Nov 17 14:00"
            label = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            break;
          case 'day':
            // Format: "Nov 17" ou "2025-11-17"
            label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            break;
          case 'week':
            // Format: "Week of Nov 17"
            label = `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            break;
          case 'month':
            // Format: "Nov 2025" ou "2025-11"
            label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            break;
          default:
            label = row.date?.toISOString().substring(0, 10) || '';
        }

        return {
          month: label, // Garde le nom "month" pour compatibilité frontend mais contient le label adapté
          revenue: parseFloat(row.revenue) || 0,
          transactions: parseInt(row.transactions) || 0
        };
      }),

      // Tours populaires - format pour recharts BarChart
      popular_tours: popularToursResult.rows.map((tour) => ({
        id: tour.tour_id,
        name: tour.name,
        booking_count: parseInt(tour.booking_count) || 0
      })),

      // Données additionnelles pour future utilisation
      overview: {
        totalRevenue: parseFloat(revenueResult.rows[0]?.total_revenue) || 0,
        totalBookings: parseInt(bookingStatsResult.rows[0]?.total_bookings) || 0,
        averageBookingValue: parseFloat(bookingStatsResult.rows[0]?.average_booking_value) || 0,
        totalUsers: parseInt(userActivityResult.rows[0]?.total_users) || 0,
        activeUsers: parseInt(userActivityResult.rows[0]?.active_users) || 0,
        newUsers: parseInt(userActivityResult.rows[0]?.new_users) || 0,
        conversionRate: parseFloat(conversionResult.rows[0]?.conversion_rate) * 100 || 0
      },
      tours: {
        mostViewed: tourViewsResult.rows.map((tour) => ({
          id: tour.id,
          name: tour.name,
          views: parseInt(tour.views),
          baseViews: parseInt(tour.base_views)
        }))
      },
      users: {
        total: parseInt(userActivityResult.rows[0]?.total_users) || 0,
        active: parseInt(userActivityResult.rows[0]?.active_users) || 0,
        new: parseInt(userActivityResult.rows[0]?.new_users) || 0,
        favorites: {
          total: parseInt(favoritesResult.rows[0]?.total_favorites) || 0,
          usersWithFavorites: parseInt(favoritesResult.rows[0]?.users_with_favorites) || 0
        }
      },
      gallery: {
        totalImages: parseInt(galleryStatsResult.rows[0]?.total_images) || 0,
        recentUploads: parseInt(galleryStatsResult.rows[0]?.recent_uploads) || 0,
        totalViews: parseInt(galleryStatsResult.rows[0]?.total_views) || 0
      },
      timeRange: timeRange,
      generatedAt: new Date().toISOString()
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
