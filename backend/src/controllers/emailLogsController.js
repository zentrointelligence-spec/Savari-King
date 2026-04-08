/**
 * Email Logs Controller
 * Gère la visualisation des logs d'emails simulés
 */

const db = require('../db');

/**
 * @description Obtenir tous les logs d'emails (ADMIN)
 * @route GET /api/admin/email-logs
 * @access Private (Admin only)
 */
exports.getAllEmailLogs = async (req, res) => {
  const { limit = 100, offset = 0, email_type, status } = req.query;

  try {
    let query = `
      SELECT
        el.*,
        u.full_name as recipient_full_name,
        b.booking_reference
      FROM email_logs el
      LEFT JOIN users u ON el.user_id = u.id
      LEFT JOIN bookings b ON el.booking_id = b.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filtrer par type d'email
    if (email_type) {
      query += ` AND el.email_type = $${paramIndex}`;
      params.push(email_type);
      paramIndex++;
    }

    // Filtrer par statut
    if (status) {
      query += ` AND el.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY el.sent_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Compter le total
    let countQuery = `SELECT COUNT(*) FROM email_logs WHERE 1=1`;
    const countParams = [];
    let countParamIndex = 1;

    if (email_type) {
      countQuery += ` AND email_type = $${countParamIndex}`;
      countParams.push(email_type);
      countParamIndex++;
    }

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
    }

    const countResult = await db.query(countQuery, countParams);

    res.status(200).json({
      success: true,
      data: {
        emails: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * @description Obtenir les logs d'emails pour un booking spécifique
 * @route GET /api/bookings/:bookingId/email-logs
 * @access Private (User or Admin)
 */
exports.getEmailLogsByBooking = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  try {
    // Vérifier que le booking appartient à l'utilisateur (si pas admin)
    if (!isAdmin) {
      const bookingCheck = await db.query(
        'SELECT user_id FROM bookings WHERE id = $1',
        [bookingId]
      );

      if (bookingCheck.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      if (bookingCheck.rows[0].user_id !== userId) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }
    }

    // Récupérer les emails
    const result = await db.query(
      `SELECT
        id, email_type, recipient_email, recipient_name,
        subject, sent_at, status, error_message
       FROM email_logs
       WHERE booking_id = $1
       ORDER BY sent_at DESC`,
      [bookingId]
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching email logs by booking:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * @description Obtenir un email log spécifique (détails complets)
 * @route GET /api/admin/email-logs/:emailLogId
 * @access Private (Admin only)
 */
exports.getEmailLogDetails = async (req, res) => {
  const { emailLogId } = req.params;

  try {
    const result = await db.query(
      `SELECT
        el.*,
        u.full_name as user_full_name,
        u.email as user_email,
        b.booking_reference
       FROM email_logs el
       LEFT JOIN users u ON el.user_id = u.id
       LEFT JOIN bookings b ON el.booking_id = b.id
       WHERE el.id = $1`,
      [emailLogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching email log details:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * @description Obtenir les statistiques des emails (ADMIN)
 * @route GET /api/admin/email-logs/stats
 * @access Private (Admin only)
 */
exports.getEmailStats = async (req, res) => {
  try {
    // Total par type
    const typeStats = await db.query(`
      SELECT email_type, COUNT(*) as count
      FROM email_logs
      GROUP BY email_type
      ORDER BY count DESC
    `);

    // Total par statut
    const statusStats = await db.query(`
      SELECT status, COUNT(*) as count
      FROM email_logs
      GROUP BY status
      ORDER BY count DESC
    `);

    // Total général
    const totalResult = await db.query(`
      SELECT COUNT(*) as total FROM email_logs
    `);

    // Emails du jour
    const todayResult = await db.query(`
      SELECT COUNT(*) as today
      FROM email_logs
      WHERE sent_at >= CURRENT_DATE
    `);

    res.status(200).json({
      success: true,
      data: {
        total: parseInt(totalResult.rows[0].total),
        today: parseInt(todayResult.rows[0].today),
        byType: typeStats.rows,
        byStatus: statusStats.rows
      }
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = exports;
