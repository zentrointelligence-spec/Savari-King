/**
 * Quote Expiration Service
 * Gère l'expiration automatique des devis après 48 heures
 */

const db = require('../db');
const { sendQuoteExpiredEmail } = require('./emailSimulationService');

/**
 * Vérifie si un devis est expiré (plus de 48h depuis l'envoi)
 * @param {Date|string} quoteSentDate - Date d'envoi du devis
 * @returns {boolean} - True si expiré
 */
const isQuoteExpired = (quoteSentDate) => {
  if (!quoteSentDate) return false;

  const sentDate = new Date(quoteSentDate);
  const now = new Date();
  const hoursDiff = (now - sentDate) / (1000 * 60 * 60); // Différence en heures

  return hoursDiff > 48;
};

/**
 * Expire un devis spécifique (appelé à la demande)
 * @param {number} revisionId - ID de la révision
 * @param {number} bookingId - ID du booking
 * @returns {Promise<boolean>} - True si expiré avec succès
 */
const expireQuote = async (revisionId, bookingId) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Mettre à jour la révision
    await client.query(
      `UPDATE booking_quote_revisions
       SET review_status = 'expired',
           is_current_version = false
       WHERE id = $1`,
      [revisionId]
    );

    // Mettre à jour le booking
    await client.query(
      `UPDATE bookings
       SET status = 'Inquiry Pending'
       WHERE id = $1`,
      [bookingId]
    );

    await client.query('COMMIT');

    console.log(`⏰ Quote expired: Revision #${revisionId}, Booking #${bookingId}`);

    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error expiring quote:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Vérifie et expire tous les devis qui ont dépassé 48h
 * Utilisé par le cron job
 * @returns {Promise<number>} - Nombre de devis expirés
 */
const checkAndExpireQuotes = async () => {
  try {
    console.log('🔍 Checking for expired quotes...');

    // Trouver tous les devis envoyés il y a plus de 48h
    const query = `
      SELECT
        bqr.id as revision_id,
        bqr.booking_id,
        b.quote_sent_date,
        b.user_id,
        b.contact_email,
        b.booking_reference
      FROM booking_quote_revisions bqr
      LEFT JOIN bookings b ON bqr.booking_id = b.id
      WHERE bqr.review_status = 'sent'
        AND b.status = 'Quote Sent'
        AND b.quote_sent_date < NOW() - INTERVAL '48 hours'
    `;

    const result = await db.query(query);

    if (result.rows.length === 0) {
      console.log('✅ No expired quotes found');
      return 0;
    }

    console.log(`📋 Found ${result.rows.length} quote(s) to expire`);

    let expiredCount = 0;

    // Expire chaque devis
    for (const quote of result.rows) {
      try {
        await expireQuote(quote.revision_id, quote.booking_id);

        // Envoyer email de notification
        try {
          await sendQuoteExpiredEmail(quote.user_id, quote.booking_id);
        } catch (emailError) {
          console.error(`Failed to send expiration email for booking #${quote.booking_id}:`, emailError);
          // Continue même si l'email échoue
        }

        expiredCount++;
      } catch (error) {
        console.error(`Error expiring quote for booking #${quote.booking_id}:`, error);
        // Continue avec les autres
      }
    }

    console.log(`✅ Successfully expired ${expiredCount} quote(s)`);

    return expiredCount;
  } catch (error) {
    console.error('Error in checkAndExpireQuotes:', error);
    throw error;
  }
};

/**
 * Vérifie si un booking spécifique a un devis expiré
 * Utilisé pour vérification à la demande (quand user accède à son booking)
 * @param {number} bookingId - ID du booking
 * @returns {Promise<boolean>} - True si expiré et mis à jour
 */
const checkBookingQuoteExpiration = async (bookingId) => {
  try {
    // Récupérer les infos du booking
    const bookingResult = await db.query(
      `SELECT id, status, quote_sent_date FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return false;
    }

    const booking = bookingResult.rows[0];

    // Si pas de statut "Quote Sent", pas besoin de vérifier
    if (booking.status !== 'Quote Sent') {
      return false;
    }

    // Vérifier si expiré
    if (isQuoteExpired(booking.quote_sent_date)) {
      // Trouver la révision active
      const revisionResult = await db.query(
        `SELECT id FROM booking_quote_revisions
         WHERE booking_id = $1 AND review_status = 'sent'
         ORDER BY created_at DESC LIMIT 1`,
        [bookingId]
      );

      if (revisionResult.rows.length > 0) {
        const revisionId = revisionResult.rows[0].id;
        await expireQuote(revisionId, bookingId);

        // Envoyer email de notification
        const userResult = await db.query(
          'SELECT user_id FROM bookings WHERE id = $1',
          [bookingId]
        );

        if (userResult.rows.length > 0) {
          try {
            await sendQuoteExpiredEmail(userResult.rows[0].user_id, bookingId);
          } catch (emailError) {
            console.error('Failed to send expiration email:', emailError);
          }
        }

        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking booking quote expiration:', error);
    return false;
  }
};

module.exports = {
  isQuoteExpired,
  expireQuote,
  checkAndExpireQuotes,
  checkBookingQuoteExpiration
};
