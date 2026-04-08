const pool = require('../db');
const emailService = require('./emailService');

/**
 * Service pour gérer les invitations aux avis après un voyage complété
 * Envoi automatique d'emails pour inviter les utilisateurs à évaluer leurs addons
 */

class ReviewInvitationService {
  /**
   * Envoie une invitation par email à laisser un avis pour les addons d'un booking
   * @param {number} bookingId - ID du booking complété
   */
  async sendReviewInvitation(bookingId) {
    try {
      // Récupérer les informations du booking
      const bookingQuery = `
        SELECT
          b.id as booking_id,
          b.user_id,
          b.tour_id,
          b.travel_date,
          b.selected_addons,
          u.firstname,
          u.lastname,
          u.email,
          t.name as tour_name,
          t.main_image_url as tour_image
        FROM bookings b
        INNER JOIN users u ON b.user_id = u.id
        INNER JOIN tours t ON b.tour_id = t.id
        WHERE b.id = $1
          AND b.status = 'Completed'
          AND b.selected_addons IS NOT NULL
      `;

      const bookingResult = await pool.query(bookingQuery, [bookingId]);

      if (bookingResult.rows.length === 0) {
        console.log(`No completed booking found with ID ${bookingId} or no addons selected`);
        return {
          success: false,
          reason: 'NO_BOOKING_OR_NO_ADDONS'
        };
      }

      const booking = bookingResult.rows[0];

      // Extraire les addons du JSONB
      const addonIds = [];
      if (booking.selected_addons && Array.isArray(booking.selected_addons)) {
        booking.selected_addons.forEach(addon => {
          if (addon.id) addonIds.push(addon.id);
        });
      }

      if (addonIds.length === 0) {
        console.log(`No addons found in booking ${bookingId}`);
        return {
          success: false,
          reason: 'NO_ADDONS'
        };
      }

      // Récupérer les détails des addons
      const addonsQuery = `
        SELECT
          a.id,
          a.name,
          a.category,
          a.icon,
          EXISTS (
            SELECT 1 FROM addon_reviews ar
            WHERE ar.booking_id = $1 AND ar.addon_id = a.id
          ) as already_reviewed
        FROM addons a
        WHERE a.id = ANY($2)
        ORDER BY a.name
      `;

      const addonsResult = await pool.query(addonsQuery, [bookingId, addonIds]);
      const addons = addonsResult.rows;

      // Filtrer les addons non encore reviewés
      const pendingReviews = addons.filter(addon => !addon.already_reviewed);

      if (pendingReviews.length === 0) {
        console.log(`All addons already reviewed for booking ${bookingId}`);
        return {
          success: false,
          reason: 'ALL_ALREADY_REVIEWED'
        };
      }

      // Préparer les données pour l'email
      const emailData = {
        to: booking.email,
        subject: `How was your experience on ${booking.tour_name}?`,
        template: 'review_invitation',
        data: {
          firstname: booking.firstname,
          lastname: booking.lastname,
          tourName: booking.tour_name,
          tourImage: booking.tour_image,
          travelDate: new Date(booking.travel_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          addons: pendingReviews,
          reviewUrl: `${process.env.FRONTEND_URL}/my-addon-reviews`,
          bookingId: booking.booking_id
        }
      };

      // Envoyer l'email via le service email
      // NOTE: Si emailService n'est pas encore implémenté, on log juste
      if (emailService && typeof emailService.sendTemplatedEmail === 'function') {
        await emailService.sendTemplatedEmail(emailData);
        console.log(`Review invitation email sent to ${booking.email} for booking ${bookingId}`);
      } else {
        console.log('='.repeat(70));
        console.log('📧 REVIEW INVITATION EMAIL (Email service not configured)');
        console.log('='.repeat(70));
        console.log(`To: ${emailData.to}`);
        console.log(`Subject: ${emailData.subject}`);
        console.log(`\nDear ${emailData.data.firstname} ${emailData.data.lastname},\n`);
        console.log(`Thank you for choosing ${emailData.data.tourName}!`);
        console.log(`\nWe hope you enjoyed your trip on ${emailData.data.travelDate}.`);
        console.log(`\nWe'd love to hear your feedback on these add-ons:\n`);
        emailData.data.addons.forEach((addon, index) => {
          console.log(`  ${index + 1}. ${addon.name} (${addon.category})`);
        });
        console.log(`\nPlease visit: ${emailData.data.reviewUrl}`);
        console.log('='.repeat(70));
      }

      return {
        success: true,
        emailSent: true,
        pendingReviews: pendingReviews.length,
        addons: pendingReviews
      };

    } catch (error) {
      console.error('Error sending review invitation:', error);
      throw error;
    }
  }

  /**
   * Envoie des invitations pour tous les bookings complétés récemment sans avis
   * Utile pour un cron job qui s'exécute quotidiennement
   * @param {number} daysBack - Nombre de jours en arrière pour chercher les bookings complétés
   */
  async sendBatchReviewInvitations(daysBack = 7) {
    try {
      // Trouver tous les bookings complétés récemment
      const query = `
        SELECT DISTINCT b.id
        FROM bookings b
        WHERE b.status = 'Completed'
          AND b.completed_at >= CURRENT_DATE - INTERVAL '${daysBack} days'
          AND b.selected_addons IS NOT NULL
          AND EXISTS (
            -- Vérifier qu'il y a au moins un addon sans avis
            SELECT 1
            FROM jsonb_array_elements(b.selected_addons) AS addon_elem
            WHERE NOT EXISTS (
              SELECT 1 FROM addon_reviews ar
              WHERE ar.booking_id = b.id
                AND ar.addon_id = (addon_elem->>'id')::INTEGER
            )
          )
        ORDER BY b.completed_at DESC
      `;

      const result = await pool.query(query);
      const bookingIds = result.rows.map(row => row.id);

      console.log(`Found ${bookingIds.length} bookings eligible for review invitations`);

      const results = [];
      for (const bookingId of bookingIds) {
        const invitationResult = await this.sendReviewInvitation(bookingId);
        results.push({
          bookingId,
          ...invitationResult
        });

        // Pause de 1 seconde entre chaque email pour éviter le spam
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        success: true,
        totalProcessed: results.length,
        emailsSent: results.filter(r => r.success).length,
        results
      };

    } catch (error) {
      console.error('Error sending batch review invitations:', error);
      throw error;
    }
  }
}

module.exports = new ReviewInvitationService();
