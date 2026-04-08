const pool = require('../db/db');

/**
 * Log an email in the database
 * @param {Object} emailData - Email data to log
 * @param {number} emailData.booking_id - Booking ID (optional)
 * @param {string} emailData.recipient_email - Recipient email address
 * @param {string} emailData.recipient_name - Recipient name (optional)
 * @param {string} emailData.email_type - Type of email (quote_sent, payment_confirmed, etc.)
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.body_text - Plain text body (optional)
 * @param {string} emailData.body_html - HTML body (optional)
 * @param {Array} emailData.attachments - Array of attachment file paths (optional)
 * @param {string} emailData.status - Status: 'sent', 'failed', 'pending'
 * @param {string} emailData.error_message - Error message if failed (optional)
 * @param {Object} emailData.metadata - Additional metadata (optional)
 */
const logEmail = async (emailData) => {
  try {
    const {
      booking_id = null,
      recipient_email,
      recipient_name = null,
      email_type,
      subject,
      body_text = null,
      body_html = null,
      attachments = null,
      status = 'sent',
      error_message = null,
      metadata = null
    } = emailData;

    const query = `
      INSERT INTO email_logs (
        booking_id,
        recipient_email,
        recipient_name,
        email_type,
        subject,
        body_text,
        body_html,
        attachments,
        status,
        error_message,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      booking_id,
      recipient_email,
      recipient_name,
      email_type,
      subject,
      body_text,
      body_html,
      attachments ? JSON.stringify(attachments) : null,
      status,
      error_message,
      metadata ? JSON.stringify(metadata) : null
    ];

    const result = await pool.query(query, values);
    console.log(`✅ Email logged: ${email_type} to ${recipient_email}`);
    return result.rows[0];
  } catch (error) {
    console.error('Error logging email:', error);
    // Don't throw - we don't want email logging to break the main flow
    return null;
  }
};

/**
 * Get all email logs with pagination and filters
 */
const getEmailLogs = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      booking_id = null,
      email_type = null,
      status = null,
      recipient_email = null,
      search = null
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (booking_id) {
      whereConditions.push(`el.booking_id = $${paramIndex}`);
      queryParams.push(booking_id);
      paramIndex++;
    }

    if (email_type) {
      whereConditions.push(`el.email_type = $${paramIndex}`);
      queryParams.push(email_type);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`el.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (recipient_email) {
      whereConditions.push(`el.recipient_email ILIKE $${paramIndex}`);
      queryParams.push(`%${recipient_email}%`);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        el.recipient_email ILIKE $${paramIndex} OR
        el.recipient_name ILIKE $${paramIndex} OR
        el.subject ILIKE $${paramIndex} OR
        b.booking_reference ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM email_logs el
      LEFT JOIN bookings b ON el.booking_id = b.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    queryParams.push(limit, offset);
    const dataQuery = `
      SELECT
        el.*,
        b.booking_reference,
        b.tour_name,
        b.status as booking_status
      FROM email_logs el
      LEFT JOIN bookings b ON el.booking_id = b.id
      ${whereClause}
      ORDER BY el.sent_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await pool.query(dataQuery, queryParams);

    return {
      logs: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching email logs:', error);
    throw error;
  }
};

/**
 * Get email log by ID
 */
const getEmailLogById = async (id) => {
  try {
    const query = `
      SELECT
        el.*,
        b.booking_reference,
        b.tour_name,
        b.status as booking_status,
        b.contact_name,
        b.contact_email
      FROM email_logs el
      LEFT JOIN bookings b ON el.booking_id = b.id
      WHERE el.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching email log:', error);
    throw error;
  }
};

/**
 * Get email logs for a specific booking
 */
const getEmailLogsByBookingId = async (bookingId) => {
  try {
    const query = `
      SELECT *
      FROM email_logs
      WHERE booking_id = $1
      ORDER BY sent_at DESC
    `;

    const result = await pool.query(query, [bookingId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching email logs for booking:', error);
    throw error;
  }
};

/**
 * Get email statistics
 */
const getEmailStatistics = async () => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_emails,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(DISTINCT email_type) as unique_types,
        COUNT(DISTINCT recipient_email) as unique_recipients,
        MIN(sent_at) as first_email_date,
        MAX(sent_at) as last_email_date
      FROM email_logs
    `;

    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching email statistics:', error);
    throw error;
  }
};

/**
 * Get email type distribution
 */
const getEmailTypeDistribution = async () => {
  try {
    const query = `
      SELECT
        email_type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM email_logs
      GROUP BY email_type
      ORDER BY count DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching email type distribution:', error);
    throw error;
  }
};

module.exports = {
  logEmail,
  getEmailLogs,
  getEmailLogById,
  getEmailLogsByBookingId,
  getEmailStatistics,
  getEmailTypeDistribution
};
