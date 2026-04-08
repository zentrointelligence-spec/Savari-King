/**
 * Email Simulation Service
 * Simule l'envoi d'emails et les enregistre dans la base de données
 * Prêt pour production - il suffit de remplacer la simulation par un vrai service SMTP
 */

const db = require('../db');

/**
 * Enregistre un email dans la table email_logs
 * @param {Object} emailData - Données de l'email
 * @returns {Promise<Object>} - Email enregistré
 */
const logEmail = async (emailData) => {
  const {
    userId,
    bookingId,
    revisionId = null,
    emailType,
    recipientEmail,
    recipientName,
    subject,
    body,
    attachments = [],
    metadata = {}
  } = emailData;

  try {
    const result = await db.query(
      `INSERT INTO email_logs (
        user_id, booking_id, revision_id, email_type,
        recipient_email, recipient_name, subject, body,
        attachments, metadata, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        bookingId,
        revisionId,
        emailType,
        recipientEmail,
        recipientName,
        subject,
        body,
        JSON.stringify(attachments),
        JSON.stringify(metadata),
        'simulated' // En production: 'sent'
      ]
    );

    console.log(`📧 [EMAIL SIMULATED] To: ${recipientEmail} | Type: ${emailType} | Subject: ${subject}`);

    return result.rows[0];
  } catch (error) {
    console.error('Error logging email:', error);
    throw error;
  }
};

/**
 * Génère le contenu HTML pour l'email de devis envoyé
 */
const generateQuoteSentEmailHTML = (data) => {
  const { customerName, bookingReference, tourName, expirationDate, loginUrl, appliedOffers = [] } = data;

  // Helper pour formater les prix
  const formatPrice = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Quote is Ready! 📋</h1>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>

          <p>Great news! Your customized quote for <strong>${tourName}</strong> is now ready for review.</p>

          <div class="highlight">
            <p><strong>⏰ Important:</strong> This quote is valid until <strong>${expirationDate}</strong> (48 hours from now).</p>
          </div>

          <p><strong>Booking Reference:</strong> ${bookingReference}</p>

          ${appliedOffers && appliedOffers.length > 0 ? `
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0;">✨ Special Offers Applied!</h3>
            ${appliedOffers.map(offer => `
              <div style="background: white; padding: 12px; margin: 10px 0; border-radius: 6px;">
                <strong style="color: #1e40af;">${offer.offer_title}</strong>
                <span style="background: #dbeafe; color: #1e40af; padding: 3px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">
                  ${offer.offer_type.replace('_', ' ')}
                </span>
                <div style="color: #475569; font-size: 13px; margin: 5px 0;">${offer.reason}</div>
                <div style="color: #059669; font-weight: bold;">Saving: ${formatPrice(offer.discount_amount)} (${offer.discount_percentage}%)</div>
              </div>
            `).join('')}
            <p style="margin: 15px 0 0 0; padding-top: 15px; border-top: 2px solid #bfdbfe; color: #059669; font-weight: 600; text-align: center;">
              💰 Total Savings: ${formatPrice(appliedOffers.reduce((sum, o) => sum + parseFloat(o.discount_amount || 0), 0))}
            </p>
          </div>
          ` : ''}

          <p>You can download your detailed quotation and proceed to payment by logging into your account:</p>

          <a href="${loginUrl}" class="button">View My Quote</a>

          <p>If you have any questions about your quote, please don't hesitate to contact us.</p>

          <p>Best regards,<br>
          <strong>Ebenezer Tours & Travels Team</strong></p>
        </div>
        <div class="footer">
          <p>Ebenezer Tours & Travels | Kerala, India</p>
          <p>Email: support@ebenezertours.com | Phone: +91 XXX XXX XXXX</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Envoie un email de devis (simulé)
 * @param {number} userId - ID de l'utilisateur
 * @param {number} bookingId - ID de la réservation
 * @param {number} revisionId - ID de la révision du devis
 * @returns {Promise<Object>} - Email loggé
 */
const sendQuoteEmail = async (userId, bookingId, revisionId) => {
  try {
    // Récupérer les informations du booking
    const bookingResult = await db.query(
      `SELECT
        b.booking_reference,
        b.contact_name,
        b.contact_email,
        b.quote_expiration_date,
        t.name as tour_name
       FROM bookings b
       LEFT JOIN tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingResult.rows[0];

    // Récupérer les offres appliquées depuis la révision (NEW)
    let appliedOffers = [];
    try {
      const revisionResult = await db.query(
        'SELECT applied_offers FROM booking_quote_revisions WHERE id = $1',
        [revisionId]
      );
      if (revisionResult.rows.length > 0 && revisionResult.rows[0].applied_offers) {
        appliedOffers = revisionResult.rows[0].applied_offers;
      }
    } catch (err) {
      console.log('No applied offers found for revision');
    }

    const expirationDate = new Date(booking.quote_expiration_date).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const emailHTML = generateQuoteSentEmailHTML({
      customerName: booking.contact_name,
      bookingReference: booking.booking_reference,
      tourName: booking.tour_name,
      expirationDate: expirationDate,
      loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-bookings`,
      appliedOffers  // NEW: Pass applied offers to email template
    });

    const emailData = {
      userId,
      bookingId,
      revisionId,
      emailType: 'quote_sent',
      recipientEmail: booking.contact_email,
      recipientName: booking.contact_name,
      subject: `Your Quote is Ready - ${booking.booking_reference}`,
      body: emailHTML,
      attachments: [
        { filename: 'detailed_quote.pdf', path: '/quotes/...' },
        { filename: 'general_quote.pdf', path: '/quotes/...' }
      ],
      metadata: {
        bookingReference: booking.booking_reference,
        tourName: booking.tour_name,
        expirationDate: booking.quote_expiration_date
      }
    };

    return await logEmail(emailData);
  } catch (error) {
    console.error('Error sending quote email:', error);
    throw error;
  }
};

/**
 * Envoie un email de devis modifié (simulé)
 */
const sendQuoteUpdatedEmail = async (userId, bookingId, oldRevisionId, newRevisionId) => {
  try {
    const bookingResult = await db.query(
      `SELECT
        b.booking_reference,
        b.contact_name,
        b.contact_email,
        b.quote_expiration_date,
        t.name as tour_name
       FROM bookings b
       LEFT JOIN tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    const booking = bookingResult.rows[0];

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Updated Quote Available 🔄</h2>
        <p>Dear ${booking.contact_name},</p>
        <p>Your quote for <strong>${booking.tour_name}</strong> has been updated with new pricing and details.</p>
        <p><strong>Important:</strong> Your previous quote has expired. Please review the new quote.</p>
        <p><strong>Booking Reference:</strong> ${booking.booking_reference}</p>
        <a href="${process.env.FRONTEND_URL}/my-bookings" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">View Updated Quote</a>
        <p>Best regards,<br>Ebenezer Tours & Travels</p>
      </body>
      </html>
    `;

    const emailData = {
      userId,
      bookingId,
      revisionId: newRevisionId,
      emailType: 'quote_updated',
      recipientEmail: booking.contact_email,
      recipientName: booking.contact_name,
      subject: `Updated Quote - ${booking.booking_reference}`,
      body: emailHTML,
      metadata: {
        bookingReference: booking.booking_reference,
        oldRevisionId,
        newRevisionId
      }
    };

    return await logEmail(emailData);
  } catch (error) {
    console.error('Error sending quote updated email:', error);
    throw error;
  }
};

/**
 * Envoie un email d'expiration de devis (simulé)
 */
const sendQuoteExpiredEmail = async (userId, bookingId) => {
  try {
    const bookingResult = await db.query(
      `SELECT
        b.booking_reference,
        b.contact_name,
        b.contact_email,
        t.name as tour_name
       FROM bookings b
       LEFT JOIN tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    const booking = bookingResult.rows[0];

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Quote Expired ⏰</h2>
        <p>Dear ${booking.contact_name},</p>
        <p>Your quote for <strong>${booking.tour_name}</strong> (${booking.booking_reference}) has expired.</p>
        <p>To receive a new quote, please contact our team or submit a new booking request.</p>
        <p><strong>Contact us:</strong> support@ebenezertours.com</p>
        <p>Best regards,<br>Ebenezer Tours & Travels</p>
      </body>
      </html>
    `;

    const emailData = {
      userId,
      bookingId,
      revisionId: null,
      emailType: 'quote_expired',
      recipientEmail: booking.contact_email,
      recipientName: booking.contact_name,
      subject: `Quote Expired - ${booking.booking_reference}`,
      body: emailHTML,
      metadata: {
        bookingReference: booking.booking_reference
      }
    };

    return await logEmail(emailData);
  } catch (error) {
    console.error('Error sending quote expired email:', error);
    throw error;
  }
};

/**
 * Envoie un email de confirmation de paiement (simulé)
 */
const sendPaymentConfirmedEmail = async (userId, bookingId) => {
  try {
    const bookingResult = await db.query(
      `SELECT
        b.booking_reference,
        b.contact_name,
        b.contact_email,
        b.final_price,
        b.travel_date,
        t.name as tour_name
       FROM bookings b
       LEFT JOIN tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    const booking = bookingResult.rows[0];

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Payment Confirmed ✅</h2>
        <p>Dear ${booking.contact_name},</p>
        <p>Thank you! Your payment has been confirmed for <strong>${booking.tour_name}</strong>.</p>
        <p><strong>Booking Reference:</strong> ${booking.booking_reference}</p>
        <p><strong>Amount Paid:</strong> ₹${booking.final_price?.toLocaleString()}</p>
        <p><strong>Travel Date:</strong> ${new Date(booking.travel_date).toLocaleDateString()}</p>
        <p>Your booking is now confirmed! We'll send you more details about your trip soon.</p>
        <p>Best regards,<br>Ebenezer Tours & Travels</p>
      </body>
      </html>
    `;

    const emailData = {
      userId,
      bookingId,
      revisionId: null,
      emailType: 'payment_confirmed',
      recipientEmail: booking.contact_email,
      recipientName: booking.contact_name,
      subject: `Payment Confirmed - ${booking.booking_reference}`,
      body: emailHTML,
      metadata: {
        bookingReference: booking.booking_reference,
        amount: booking.final_price
      }
    };

    return await logEmail(emailData);
  } catch (error) {
    console.error('Error sending payment confirmed email:', error);
    throw error;
  }
};

/**
 * Envoie un email de confirmation de réservation (simulé)
 */
const sendBookingConfirmedEmail = async (userId, bookingId) => {
  try {
    const bookingResult = await db.query(
      `SELECT
        b.booking_reference,
        b.contact_name,
        b.contact_email,
        b.travel_date,
        b.payment_receipt_pdf,
        b.receipt_number,
        t.name as tour_name,
        t.duration_days
       FROM bookings b
       LEFT JOIN tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    const booking = bookingResult.rows[0];

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Payment Confirmed & Booking Complete! 🎉</h2>
        <p>Dear ${booking.contact_name},</p>
        <p>Your payment has been successfully processed and your booking for <strong>${booking.tour_name}</strong> is now confirmed!</p>
        <p><strong>Booking Reference:</strong> ${booking.booking_reference}</p>
        <p><strong>Receipt Number:</strong> ${booking.receipt_number || 'N/A'}</p>
        <p><strong>Travel Date:</strong> ${new Date(booking.travel_date).toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${booking.duration_days} days</p>
        <p><strong>📄 Payment Receipt:</strong> Please find your official payment receipt attached to this email.</p>
        <p>We're excited to have you with us! Further details and travel documents will be sent closer to your departure date.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Ebenezer Tours & Travels</p>
      </body>
      </html>
    `;

    const emailData = {
      userId,
      bookingId,
      revisionId: null,
      emailType: 'booking_confirmed',
      recipientEmail: booking.contact_email,
      recipientName: booking.contact_name,
      subject: `Payment Confirmed - ${booking.booking_reference}`,
      body: emailHTML,
      attachments: booking.payment_receipt_pdf ? [
        {
          filename: `payment-receipt-${booking.booking_reference}.pdf`,
          path: booking.payment_receipt_pdf
        }
      ] : [],
      metadata: {
        bookingReference: booking.booking_reference,
        travelDate: booking.travel_date,
        receiptNumber: booking.receipt_number
      }
    };

    return await logEmail(emailData);
  } catch (error) {
    console.error('Error sending booking confirmed email:', error);
    throw error;
  }
};

/**
 * Récupère les logs d'emails avec filtres
 */
const getEmailLogs = async (filters = {}) => {
  try {
    let query = 'SELECT * FROM email_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.emailType) {
      query += ` AND email_type = $${paramIndex}`;
      params.push(filters.emailType);
      paramIndex++;
    }

    if (filters.bookingId) {
      query += ` AND booking_id = $${paramIndex}`;
      params.push(filters.bookingId);
      paramIndex++;
    }

    if (filters.userId) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(filters.userId);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting email logs:', error);
    throw error;
  }
};

module.exports = {
  logEmail,
  sendQuoteEmail,
  sendQuoteUpdatedEmail,
  sendQuoteExpiredEmail,
  sendPaymentConfirmedEmail,
  sendBookingConfirmedEmail,
  getEmailLogs
};
