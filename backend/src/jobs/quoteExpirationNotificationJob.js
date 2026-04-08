/**
 * Quote Expiration Notification Job
 * Automatically sends notifications for:
 * 1. Quotes expiring within 24 hours
 * 2. Expired quotes
 * 3. Upcoming trips (7 days before travel)
 */

const cron = require('node-cron');
const db = require('../db');
const notificationService = require('../services/notificationService');

class QuoteExpirationNotificationJob {
  constructor() {
    this.job = null;
  }

  /**
   * Check and notify for quotes expiring soon (within 24 hours)
   */
  async checkExpiringSoonQuotes() {
    try {
      const expiringSoonQuery = `
        SELECT
          b.*,
          t.name as tour_name,
          u.id as user_id
        FROM bookings b
        JOIN tours t ON b.tour_id = t.id
        JOIN users u ON b.user_id = u.id
        WHERE b.status = 'Quote Sent'
        AND b.quote_expiration_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.booking_id = b.id
          AND n.type = 'quote_expiring_soon'
          AND n.created_at > NOW() - INTERVAL '24 hours'
        )
      `;

      const result = await db.query(expiringSoonQuery);

      for (const booking of result.rows) {
        const hoursRemaining = Math.floor(
          (new Date(booking.quote_expiration_date) - new Date()) / (1000 * 60 * 60)
        );

        await notificationService.createQuoteExpiringSoonNotification(
          booking,
          hoursRemaining
        );
      }

      if (result.rows.length > 0) {
        console.log(`✅ Sent ${result.rows.length} quote expiring soon notifications`);
      }
    } catch (error) {
      console.error('❌ Error checking expiring quotes:', error);
    }
  }

  /**
   * Check and notify for expired quotes
   */
  async checkExpiredQuotes() {
    try {
      const expiredQuery = `
        SELECT
          b.*,
          t.name as tour_name,
          u.id as user_id
        FROM bookings b
        JOIN tours t ON b.tour_id = t.id
        JOIN users u ON b.user_id = u.id
        WHERE b.status = 'Quote Sent'
        AND b.quote_expiration_date < NOW()
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.booking_id = b.id
          AND n.type = 'quote_expired'
        )
      `;

      const result = await db.query(expiredQuery);

      for (const booking of result.rows) {
        // Envoyer notification
        await notificationService.createQuoteExpiredNotification(booking);

        // ✅ Mettre à jour le statut du booking
        await db.query(`
          UPDATE bookings
          SET
            quote_status = 'expired',
            status = 'Quote Expired'
          WHERE id = $1
        `, [booking.id]);

        console.log(`📋 Updated booking #${booking.id} status to 'Quote Expired'`);
      }

      if (result.rows.length > 0) {
        console.log(`✅ Sent ${result.rows.length} quote expired notifications and updated statuses`);
      }
    } catch (error) {
      console.error('❌ Error checking expired quotes:', error);
    }
  }

  /**
   * Check and notify for upcoming trips (7 days before travel)
   */
  async checkUpcomingTrips() {
    try {
      const upcomingQuery = `
        SELECT
          b.*,
          t.name as tour_name,
          u.id as user_id
        FROM bookings b
        JOIN tours t ON b.tour_id = t.id
        JOIN users u ON b.user_id = u.id
        WHERE b.status = 'Payment Confirmed'
        AND b.travel_date = CURRENT_DATE + INTERVAL '7 days'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.booking_id = b.id
          AND n.type = 'booking_reminder'
        )
      `;

      const result = await db.query(upcomingQuery);

      for (const booking of result.rows) {
        await notificationService.createBookingReminderNotification(booking, 7);
      }

      if (result.rows.length > 0) {
        console.log(`✅ Sent ${result.rows.length} booking reminder notifications`);
      }
    } catch (error) {
      console.error('❌ Error checking upcoming trips:', error);
    }
  }

  /**
   * Start the cron job
   * Runs every hour at minute 0
   */
  start() {
    this.job = cron.schedule('0 * * * *', async () => {
      console.log('🔔 Running quote expiration notification job...');
      await this.checkExpiringSoonQuotes();
      await this.checkExpiredQuotes();
      await this.checkUpcomingTrips();
    });

    console.log('✅ Quote expiration notification job started (runs hourly)');
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.job) {
      this.job.stop();
      console.log('⏹️  Quote expiration notification job stopped');
    }
  }
}

module.exports = new QuoteExpirationNotificationJob();
