const db = require('../db');

/**
 * Special Offers Analytics Controller
 * Provides analytics and insights about special offers usage
 */

/**
 * Get overview statistics for all special offers
 * @route GET /api/analytics/special-offers/overview
 * @access Private (Admin only)
 */
exports.getOffersOverview = async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE is_active = true AND NOW() BETWEEN valid_from AND valid_until) as active_offers,
        COUNT(*) FILTER (WHERE is_active = true AND NOW() > valid_until) as expired_offers,
        COUNT(*) FILTER (WHERE is_active = true AND NOW() < valid_from) as upcoming_offers,
        SUM(usage_count) as total_usage,
        SUM(conversion_count) as total_conversions,
        SUM(click_count) as total_clicks
      FROM special_offers
    `;

    const result = await db.query(query);
    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        activeOffers: parseInt(stats.active_offers || 0),
        expiredOffers: parseInt(stats.expired_offers || 0),
        upcomingOffers: parseInt(stats.upcoming_offers || 0),
        totalUsage: parseInt(stats.total_usage || 0),
        totalConversions: parseInt(stats.total_conversions || 0),
        totalClicks: parseInt(stats.total_clicks || 0),
        conversionRate: stats.total_clicks > 0
          ? ((parseInt(stats.total_conversions || 0) / parseInt(stats.total_clicks || 0)) * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Error getting offers overview:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get top performing offers
 * @route GET /api/analytics/special-offers/top-performers
 * @access Private (Admin only)
 */
exports.getTopPerformingOffers = async (req, res) => {
  const { limit = 10, sortBy = 'usage_count' } = req.query;

  try {
    const validSortFields = ['usage_count', 'conversion_count', 'click_count', 'view_count'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'usage_count';

    const query = `
      SELECT
        id,
        title,
        offer_type,
        discount_percentage,
        discount_amount,
        usage_count,
        usage_limit,
        conversion_count,
        click_count,
        view_count,
        valid_from,
        valid_until,
        is_active,
        CASE
          WHEN click_count > 0 THEN (conversion_count::float / click_count * 100)
          ELSE 0
        END as conversion_rate
      FROM special_offers
      WHERE is_active = true
      ORDER BY ${sortField} DESC NULLS LAST
      LIMIT $1
    `;

    const result = await db.query(query, [parseInt(limit)]);

    res.status(200).json({
      success: true,
      data: result.rows.map(offer => ({
        id: offer.id,
        title: offer.title,
        offerType: offer.offer_type,
        discountPercentage: parseFloat(offer.discount_percentage || 0),
        discountAmount: parseFloat(offer.discount_amount || 0),
        usageCount: offer.usage_count || 0,
        usageLimit: offer.usage_limit,
        utilizationRate: offer.usage_limit
          ? ((offer.usage_count / offer.usage_limit) * 100).toFixed(2)
          : null,
        conversionCount: offer.conversion_count || 0,
        clickCount: offer.click_count || 0,
        viewCount: offer.view_count || 0,
        conversionRate: parseFloat(offer.conversion_rate || 0).toFixed(2),
        validFrom: offer.valid_from,
        validUntil: offer.valid_until,
        isActive: offer.is_active
      }))
    });
  } catch (error) {
    console.error('Error getting top performing offers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get offers usage by type
 * @route GET /api/analytics/special-offers/by-type
 * @access Private (Admin only)
 */
exports.getOffersByType = async (req, res) => {
  try {
    const query = `
      SELECT
        offer_type,
        COUNT(*) as offer_count,
        SUM(usage_count) as total_usage,
        AVG(
          CASE
            WHEN usage_limit IS NOT NULL AND usage_limit > 0
            THEN (usage_count::float / usage_limit * 100)
            ELSE NULL
          END
        ) as avg_utilization_rate,
        SUM(conversion_count) as total_conversions
      FROM special_offers
      WHERE is_active = true
      GROUP BY offer_type
      ORDER BY total_usage DESC
    `;

    const result = await db.query(query);

    res.status(200).json({
      success: true,
      data: result.rows.map(row => ({
        offerType: row.offer_type,
        offerCount: parseInt(row.offer_count || 0),
        totalUsage: parseInt(row.total_usage || 0),
        avgUtilizationRate: row.avg_utilization_rate
          ? parseFloat(row.avg_utilization_rate).toFixed(2)
          : null,
        totalConversions: parseInt(row.total_conversions || 0)
      }))
    });
  } catch (error) {
    console.error('Error getting offers by type:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get revenue impact of special offers
 * @route GET /api/analytics/special-offers/revenue-impact
 * @access Private (Admin only)
 */
exports.getRevenueImpact = async (req, res) => {
  try {
    // Calculate total discounts given through special offers
    const query = `
      SELECT
        COUNT(DISTINCT b.id) as bookings_with_offers,
        COUNT(DISTINCT bqr.id) as revisions_with_offers,
        SUM(
          (bqr.applied_offers::jsonb -> 0 ->> 'discount_amount')::numeric
        ) as total_discount_amount
      FROM bookings b
      LEFT JOIN booking_quote_revisions bqr ON b.id = bqr.booking_id
      WHERE bqr.applied_offers IS NOT NULL
        AND jsonb_array_length(bqr.applied_offers) > 0
        AND b.status IN ('Payment Confirmed', 'Trip Completed')
    `;

    const result = await db.query(query);
    const impact = result.rows[0];

    // Get average discount per booking
    const avgQuery = `
      SELECT
        AVG(
          (SELECT SUM((offer->>'discount_amount')::numeric)
           FROM jsonb_array_elements(bqr.applied_offers) as offer)
        ) as avg_discount_per_booking
      FROM booking_quote_revisions bqr
      JOIN bookings b ON b.id = bqr.booking_id
      WHERE bqr.applied_offers IS NOT NULL
        AND jsonb_array_length(bqr.applied_offers) > 0
        AND b.status IN ('Payment Confirmed', 'Trip Completed')
    `;

    const avgResult = await db.query(avgQuery);

    res.status(200).json({
      success: true,
      data: {
        bookingsWithOffers: parseInt(impact.bookings_with_offers || 0),
        revisionsWithOffers: parseInt(impact.revisions_with_offers || 0),
        totalDiscountGiven: parseFloat(impact.total_discount_amount || 0),
        avgDiscountPerBooking: parseFloat(avgResult.rows[0]?.avg_discount_per_booking || 0).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error getting revenue impact:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get offers usage timeline (last 30 days)
 * @route GET /api/analytics/special-offers/timeline
 * @access Private (Admin only)
 */
exports.getOffersTimeline = async (req, res) => {
  const { days = 30 } = req.query;

  try {
    const query = `
      SELECT
        DATE(bqr.created_at) as date,
        COUNT(DISTINCT bqr.id) as revisions_count,
        COUNT(DISTINCT b.id) as bookings_count,
        SUM(
          (SELECT SUM((offer->>'discount_amount')::numeric)
           FROM jsonb_array_elements(bqr.applied_offers) as offer)
        ) as total_discount
      FROM booking_quote_revisions bqr
      JOIN bookings b ON b.id = bqr.booking_id
      WHERE bqr.applied_offers IS NOT NULL
        AND jsonb_array_length(bqr.applied_offers) > 0
        AND bqr.created_at >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY DATE(bqr.created_at)
      ORDER BY date DESC
    `;

    const result = await db.query(query);

    res.status(200).json({
      success: true,
      data: result.rows.map(row => ({
        date: row.date,
        revisionsCount: parseInt(row.revisions_count || 0),
        bookingsCount: parseInt(row.bookings_count || 0),
        totalDiscount: parseFloat(row.total_discount || 0).toFixed(2)
      }))
    });
  } catch (error) {
    console.error('Error getting offers timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = exports;
