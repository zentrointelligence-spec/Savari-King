/**
 * Admin Notification Service
 * Gère les logs d'activités admin et les notifications
 */

const db = require('../db');

/**
 * Enregistre une activité admin
 * @param {number} adminId - ID de l'admin
 * @param {string} activityType - Type d'activité (quote_sent, quote_modified, etc.)
 * @param {string} description - Description de l'activité
 * @param {number} bookingId - ID du booking concerné (optionnel)
 * @param {Object} metadata - Données supplémentaires (optionnel)
 * @returns {Promise<Object>} - Activité enregistrée
 */
const logAdminActivity = async (adminId, activityType, description, bookingId = null, metadata = {}) => {
  try {
    const result = await db.query(
      `INSERT INTO admin_activity_logs (
        admin_id,
        activity_type,
        description,
        related_booking_id,
        metadata
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        adminId,
        activityType,
        description,
        bookingId,
        JSON.stringify(metadata)
      ]
    );

    console.log(`📝 Admin activity logged: ${activityType} by admin #${adminId}`);

    return result.rows[0];
  } catch (error) {
    console.error('Error logging admin activity:', error);
    throw error;
  }
};

/**
 * Récupère les activités récentes d'un admin
 * @param {number} adminId - ID de l'admin
 * @param {number} limit - Nombre d'activités à retourner (défaut: 50)
 * @returns {Promise<Array>} - Liste des activités
 */
const getRecentAdminActivities = async (adminId, limit = 50) => {
  try {
    const result = await db.query(
      `SELECT * FROM admin_activity_logs
       WHERE admin_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [adminId, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting admin activities:', error);
    throw error;
  }
};

/**
 * Récupère toutes les activités récentes (tous les admins)
 * @param {number} limit - Nombre d'activités à retourner (défaut: 100)
 * @returns {Promise<Array>} - Liste des activités avec infos admin
 */
const getAllRecentActivities = async (limit = 100) => {
  try {
    const result = await db.query(
      `SELECT
        aal.*,
        u.full_name as admin_name,
        u.email as admin_email,
        b.booking_reference
       FROM admin_activity_logs aal
       LEFT JOIN users u ON aal.admin_id = u.id
       LEFT JOIN bookings b ON aal.related_booking_id = b.id
       ORDER BY aal.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting all activities:', error);
    throw error;
  }
};

/**
 * Récupère les activités pour un booking spécifique
 * @param {number} bookingId - ID du booking
 * @returns {Promise<Array>} - Liste des activités
 */
const getBookingActivities = async (bookingId) => {
  try {
    const result = await db.query(
      `SELECT
        aal.*,
        u.full_name as admin_name,
        u.email as admin_email
       FROM admin_activity_logs aal
       LEFT JOIN users u ON aal.admin_id = u.id
       WHERE aal.related_booking_id = $1
       ORDER BY aal.created_at DESC`,
      [bookingId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting booking activities:', error);
    throw error;
  }
};

/**
 * Crée une notification toast pour l'admin
 * Cette fonction retourne un objet qui sera envoyé au frontend
 * @param {string} type - Type de notification (success, info, warning, error)
 * @param {string} message - Message à afficher
 * @param {Object} data - Données supplémentaires
 * @returns {Object} - Objet notification
 */
const createToastNotification = (type, message, data = {}) => {
  return {
    type, // 'success', 'info', 'warning', 'error'
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Log d'activité: Devis envoyé
 */
const logQuoteSent = async (adminId, bookingId, customerEmail) => {
  return await logAdminActivity(
    adminId,
    'quote_sent',
    `Quote sent to ${customerEmail}`,
    bookingId,
    { customerEmail }
  );
};

/**
 * Log d'activité: Devis modifié et renvoyé
 */
const logQuoteUpdated = async (adminId, bookingId, revisionNumber) => {
  return await logAdminActivity(
    adminId,
    'quote_updated',
    `Quote updated and resent (Revision ${revisionNumber})`,
    bookingId,
    { revisionNumber }
  );
};

/**
 * Log d'activité: Paiement en attente (virement bancaire)
 */
const logPaymentPending = async (adminId, bookingId, amount) => {
  return await logAdminActivity(
    adminId,
    'payment_pending',
    `Bank transfer payment pending confirmation (₹${amount.toLocaleString()})`,
    bookingId,
    { amount }
  );
};

/**
 * Log d'activité: Paiement confirmé
 */
const logPaymentConfirmed = async (adminId, bookingId, amount, method) => {
  return await logAdminActivity(
    adminId,
    'payment_confirmed',
    `Payment confirmed via ${method} (₹${amount.toLocaleString()})`,
    bookingId,
    { amount, method }
  );
};

/**
 * Log d'activité: Révision démarrée
 */
const logReviewStarted = async (adminId, bookingId) => {
  return await logAdminActivity(
    adminId,
    'review_started',
    'Quote review started',
    bookingId
  );
};

/**
 * Log d'activité: Révision validée
 */
const logReviewValidated = async (adminId, bookingId, revisionId) => {
  return await logAdminActivity(
    adminId,
    'review_validated',
    'Quote review validated and ready to send',
    bookingId,
    { revisionId }
  );
};

/**
 * Log d'activité: Modification des véhicules
 */
const logVehiclesModified = async (adminId, bookingId, changes) => {
  return await logAdminActivity(
    adminId,
    'vehicles_modified',
    'Vehicles modified in quote review',
    bookingId,
    { changes }
  );
};

/**
 * Log d'activité: Modification des addons
 */
const logAddonsModified = async (adminId, bookingId, changes) => {
  return await logAdminActivity(
    adminId,
    'addons_modified',
    'Add-ons modified in quote review',
    bookingId,
    { changes }
  );
};

/**
 * Log d'activité: Réductions appliquées
 */
const logDiscountsApplied = async (adminId, bookingId, discounts) => {
  const totalDiscount = discounts.reduce((sum, d) => sum + (d.amount || 0), 0);
  return await logAdminActivity(
    adminId,
    'discounts_applied',
    `Discounts applied (Total: ₹${totalDiscount.toLocaleString()})`,
    bookingId,
    { discounts, totalDiscount }
  );
};

/**
 * Log d'activité: Frais ajoutés
 */
const logFeesAdded = async (adminId, bookingId, fees) => {
  const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  return await logAdminActivity(
    adminId,
    'fees_added',
    `Additional fees added (Total: ₹${totalFees.toLocaleString()})`,
    bookingId,
    { fees, totalFees }
  );
};

module.exports = {
  logAdminActivity,
  getRecentAdminActivities,
  getAllRecentActivities,
  getBookingActivities,
  createToastNotification,
  // Helper functions
  logQuoteSent,
  logQuoteUpdated,
  logPaymentPending,
  logPaymentConfirmed,
  logReviewStarted,
  logReviewValidated,
  logVehiclesModified,
  logAddonsModified,
  logDiscountsApplied,
  logFeesAdded
};
