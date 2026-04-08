const pool = require('../db');
const reviewInvitationService = require('../services/reviewInvitationService');

/**
 * Job pour traiter les invitations aux avis en attente
 * Peut être exécuté:
 * - Via un cron job (ex: toutes les heures)
 * - Manuellement via un endpoint admin
 * - Au démarrage du serveur
 */

async function processReviewInvitations() {
  console.log('[Review Invitations] Starting processing...');

  try {
    // Récupérer les événements en attente
    const eventsQuery = `
      SELECT
        bce.id as event_id,
        bce.booking_id,
        bce.created_at as event_created_at,
        b.user_id,
        u.email as user_email,
        u.firstname,
        u.lastname,
        t.name as tour_name
      FROM booking_completion_events bce
      INNER JOIN bookings b ON bce.booking_id = b.id
      INNER JOIN users u ON b.user_id = u.id
      INNER JOIN tours t ON b.tour_id = t.id
      WHERE bce.processed = FALSE
      ORDER BY bce.created_at ASC
      LIMIT 50
    `;

    const eventsResult = await pool.query(eventsQuery);
    const pendingEvents = eventsResult.rows;

    if (pendingEvents.length === 0) {
      console.log('[Review Invitations] No pending events to process');
      return {
        success: true,
        processed: 0,
        message: 'No pending events'
      };
    }

    console.log(`[Review Invitations] Found ${pendingEvents.length} pending event(s)`);

    let successCount = 0;
    let errorCount = 0;

    // Traiter chaque événement
    for (const event of pendingEvents) {
      try {
        console.log(`[Review Invitations] Processing event ${event.event_id} for booking ${event.booking_id}`);

        // Envoyer l'invitation
        const result = await reviewInvitationService.sendReviewInvitation(event.booking_id);

        if (result.success) {
          // Marquer comme traité avec succès
          await pool.query(
            'SELECT mark_completion_event_processed($1, $2, $3)',
            [event.event_id, true, null]
          );
          successCount++;
          console.log(`[Review Invitations] ✓ Event ${event.event_id} processed successfully`);
        } else {
          // Marquer comme traité mais sans email (ex: tous les addons déjà reviewés)
          await pool.query(
            'SELECT mark_completion_event_processed($1, $2, $3)',
            [event.event_id, false, result.reason || 'No email sent']
          );
          console.log(`[Review Invitations] - Event ${event.event_id} processed but no email sent: ${result.reason}`);
        }

      } catch (error) {
        errorCount++;
        console.error(`[Review Invitations] ✗ Error processing event ${event.event_id}:`, error.message);

        // Marquer comme traité avec erreur
        await pool.query(
          'SELECT mark_completion_event_processed($1, $2, $3)',
          [event.event_id, false, error.message]
        );
      }

      // Pause de 1 seconde entre chaque traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const summary = {
      success: true,
      processed: pendingEvents.length,
      emailsSent: successCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    };

    console.log('[Review Invitations] Processing completed:', summary);
    return summary;

  } catch (error) {
    console.error('[Review Invitations] Fatal error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Si exécuté directement (pas importé)
if (require.main === module) {
  processReviewInvitations()
    .then(result => {
      console.log('Job completed:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}

module.exports = processReviewInvitations;
