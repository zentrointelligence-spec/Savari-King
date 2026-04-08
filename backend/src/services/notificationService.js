/**
 * Notification Service
 * Handles creating and managing user notifications
 */

const db = require('../db');

class NotificationService {
  /**
   * Create a notification for a user
   */
  async createNotification({
    userId,
    bookingId = null,
    type,
    title,
    message,
    metadata = {},
    status = 'sent'
  }) {
    try {
      const query = `
        INSERT INTO notifications (user_id, booking_id, type, title, message, metadata, is_read, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, false, $7, NOW())
        RETURNING *
      `;

      const values = [
        userId,
        bookingId,
        type,
        title,
        message,
        JSON.stringify(metadata),
        status
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create quote received notification
   */
  async createQuoteReceivedNotification(bookingData, pdfPaths) {
    try {
      const title = 'Quote Received for Your Booking';
      const message = `Your quote for ${bookingData.tour_name} has been prepared and is ready for review. The quote is valid for 48 hours.`;

      const metadata = {
        booking_reference: bookingData.booking_reference,
        tour_name: bookingData.tour_name,
        travel_date: bookingData.travel_date,
        total_amount: bookingData.final_price || bookingData.estimated_price,
        detailed_pdf: pdfPaths.detailed.relativePath,
        general_pdf: pdfPaths.general.relativePath,
        valid_until: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      };

      return await this.createNotification({
        userId: bookingData.user_id,
        bookingId: bookingData.id,
        type: 'quote_received',
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Error creating quote received notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, limit = 50) {
    try {
      const query = `
        SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;

      const result = await db.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = $1 AND is_read = false
      `;

      const result = await db.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const query = `
        UPDATE notifications
        SET is_read = true, read_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;

      const result = await db.query(query, [notificationId, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const query = `
        UPDATE notifications
        SET is_read = true, read_at = NOW()
        WHERE user_id = $1 AND is_read = false
        RETURNING COUNT(*) as count
      `;

      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      const query = `
        DELETE FROM notifications
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;

      const result = await db.query(query, [notificationId, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Create payment confirmed notification
   */
  async createPaymentConfirmedNotification(bookingData) {
    try {
      const title = 'Payment Confirmed! 🎉';
      const message = `Your payment for ${bookingData.tour_name} has been confirmed. Get ready for an amazing journey!`;

      const metadata = {
        booking_reference: bookingData.booking_reference,
        tour_name: bookingData.tour_name,
        travel_date: bookingData.travel_date,
        final_price: bookingData.final_price,
        payment_timestamp: new Date().toISOString()
      };

      return await this.createNotification({
        userId: bookingData.user_id,
        bookingId: bookingData.id,
        type: 'payment_confirmed',
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Error creating payment confirmed notification:', error);
      throw error;
    }
  }

  /**
   * Create trip completed notification
   */
  async createTripCompletedNotification(bookingData) {
    try {
      const title = 'Trip Completed - Share Your Experience!';
      const message = `We hope you enjoyed ${bookingData.tour_name}! Please leave a review to help other travelers.`;

      const metadata = {
        booking_reference: bookingData.booking_reference,
        tour_name: bookingData.tour_name,
        booking_id: bookingData.id,
        can_review: true
      };

      return await this.createNotification({
        userId: bookingData.user_id,
        bookingId: bookingData.id,
        type: 'trip_completed',
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Error creating trip completed notification:', error);
      throw error;
    }
  }

  /**
   * Create quote expiring soon notification
   */
  async createQuoteExpiringSoonNotification(bookingData, hoursRemaining) {
    try {
      const title = 'Quote Expiring Soon! ⏰';
      const message = `Your quote for ${bookingData.tour_name} expires in ${hoursRemaining} hours. Book now to secure your adventure!`;

      const metadata = {
        booking_reference: bookingData.booking_reference,
        tour_name: bookingData.tour_name,
        hours_remaining: hoursRemaining,
        quote_expiration_date: bookingData.quote_expiration_date
      };

      return await this.createNotification({
        userId: bookingData.user_id,
        bookingId: bookingData.id,
        type: 'quote_expiring_soon',
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Error creating quote expiring soon notification:', error);
      throw error;
    }
  }

  /**
   * Create quote expired notification
   */
  async createQuoteExpiredNotification(bookingData) {
    try {
      const title = 'Quote Expired';
      const message = `Your quote for ${bookingData.tour_name} has expired. Contact us to request a new quote.`;

      const metadata = {
        booking_reference: bookingData.booking_reference,
        tour_name: bookingData.tour_name,
        expired_at: new Date().toISOString()
      };

      return await this.createNotification({
        userId: bookingData.user_id,
        bookingId: bookingData.id,
        type: 'quote_expired',
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Error creating quote expired notification:', error);
      throw error;
    }
  }

  /**
   * Create quote revision requested notification
   */
  async createQuoteRevisionRequestedNotification(bookingData, revisionDetails) {
    try {
      const title = 'Quote Revision Requested';
      const message = `You requested a revision for ${bookingData.tour_name}. Our team will review and respond shortly.`;

      const metadata = {
        booking_reference: bookingData.booking_reference,
        tour_name: bookingData.tour_name,
        revision_notes: revisionDetails.notes || revisionDetails.client_notes || ''
      };

      return await this.createNotification({
        userId: bookingData.user_id,
        bookingId: bookingData.id,
        type: 'quote_revision_requested',
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Error creating quote revision requested notification:', error);
      throw error;
    }
  }

  /**
   * Create quote revision sent notification
   */
  async createQuoteRevisionSentNotification(bookingData, revisionData) {
    try {
      const title = 'Revised Quote Available!';
      const message = `Your revised quote for ${bookingData.tour_name} is ready. Valid for 48 hours.`;

      const metadata = {
        booking_reference: bookingData.booking_reference,
        tour_name: bookingData.tour_name,
        new_price: revisionData.new_price || revisionData.final_price,
        revision_notes: revisionData.admin_notes || '',
        valid_until: revisionData.expiration_date || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      };

      return await this.createNotification({
        userId: bookingData.user_id,
        bookingId: bookingData.id,
        type: 'quote_revision_sent',
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Error creating quote revision sent notification:', error);
      throw error;
    }
  }

  /**
   * Create review approved notification
   */
  async createReviewApprovedNotification(userId, tourName, reviewId) {
    try {
      const title = 'Review Approved! ✅';
      const message = `Your review for ${tourName} has been approved and is now visible to other travelers.`;

      const metadata = {
        tour_name: tourName,
        review_id: reviewId,
        approved_at: new Date().toISOString()
      };

      return await this.createNotification({
        userId,
        bookingId: null,
        type: 'review_approved',
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Error creating review approved notification:', error);
      throw error;
    }
  }

  /**
   * Create booking reminder notification
   */
  async createBookingReminderNotification(bookingData, daysUntilTravel) {
    try {
      const title = `Upcoming Trip Reminder! 🧳`;
      const message = `Your ${bookingData.tour_name} adventure is in ${daysUntilTravel} days! Get ready for an amazing experience.`;

      const metadata = {
        booking_reference: bookingData.booking_reference,
        tour_name: bookingData.tour_name,
        travel_date: bookingData.travel_date,
        days_until_travel: daysUntilTravel
      };

      return await this.createNotification({
        userId: bookingData.user_id,
        bookingId: bookingData.id,
        type: 'booking_reminder',
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Error creating booking reminder notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
