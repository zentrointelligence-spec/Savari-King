const db = require("../db");

// Charger les variables d'environnement si pas déjà fait
if (!process.env.DB_DATABASE) {
  require("dotenv").config();
}

/**
 * Logs an administrative action to the audit log.
 * @param {number} adminId - The ID of the admin performing the action.
 * @param {string} action - The type of action (e.g., 'CREATE', 'UPDATE', 'DELETE').
 * @param {string} entityType - The type of entity being affected (e.g., 'Tour', 'User').
 * @param {number} entityId - The ID of the entity being affected.
 * @param {object} details - A JSON object with details about the change.
 * @param {string} ipAddress - IP address of the admin (optional).
 * @param {string} userAgent - User agent string (optional).
 */
async function logAdminAction(
  adminId,
  action,
  entityType,
  entityId,
  details,
  ipAddress = null,
  userAgent = null
) {
  try {
    // Validation des paramètres requis
    if (!adminId || !action || !entityType) {
      console.error("Missing required parameters for audit log:", {
        adminId,
        action,
        entityType,
      });
      return;
    }

    // Validation des types d'actions autorisées
    const validActions = [
      "CREATE",
      "UPDATE",
      "DELETE",
      "APPROVE",
      "REJECT",
      "TOGGLE_STATUS",
      "LINK",
      "UNLINK",
      "LOGIN",
      "LOGOUT",
    ];
    if (!validActions.includes(action)) {
      console.warn(`Invalid action type for audit log: ${action}`);
    }

    // Validation des types d'entités autorisées
    const validEntities = [
      "Tour",
      "User",
      "Vehicle",
      "AddOn",
      "PackageTier",
      "Review",
      "PasswordReset",
      "TourAddOn",
      "Booking",
    ];
    if (!validEntities.includes(entityType)) {
      console.warn(`Invalid entity type for audit log: ${entityType}`);
    }

    // Insérer dans la base de données
    await db.query(
      `INSERT INTO audit_logs (admin_user_id, action, target_entity, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        adminId,
        action,
        entityType,
        entityId,
        JSON.stringify(details || {}),
        ipAddress,
        userAgent,
      ]
    );

    // Log de confirmation (optionnel en développement)
    if (process.env.NODE_ENV === "development") {
      console.log(
        `AUDIT: Admin #${adminId} performed ${action} on ${entityType} #${entityId}`
      );
    }
  } catch (error) {
    console.error("Error logging admin action:", error);
    // Ne pas faire échouer l'opération principale si l'audit échoue
    // Mais on peut envoyer une alerte ou notification en production
  }
}

/**
 * Récupère les logs d'audit avec pagination et filtres
 * @param {object} filters - Filtres pour la recherche
 * @returns {Promise<Array>} Liste des logs d'audit
 */
async function getAuditLogs(filters = {}) {
  try {
    const {
      adminId,
      action,
      entityType,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

    let query = `
      SELECT a.*, u.full_name as admin_name, u.email as admin_email
      FROM audit_logs a
      LEFT JOIN Users u ON a.admin_user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (adminId) {
      query += ` AND a.admin_user_id = $${paramIndex}`;
      params.push(adminId);
      paramIndex++;
    }

    if (action) {
      query += ` AND a.action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    if (entityType) {
      query += ` AND a.target_entity = $${paramIndex}`;
      params.push(entityType);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND a.timestamp >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND a.timestamp <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY a.timestamp DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
}

/**
 * Récupère les statistiques d'audit pour le dashboard
 * @returns {Promise<object>} Statistiques d'audit
 */
async function getAuditStats() {
  try {
    const [totalLogs, todayLogs, topActions, topEntities] = await Promise.all([
      // Total des logs
      db.query("SELECT COUNT(*) as total FROM audit_logs"),

      // Logs d'aujourd'hui
      db.query(
        `SELECT COUNT(*) as today FROM audit_logs WHERE DATE(timestamp) = CURRENT_DATE`
      ),

      // Top 5 des actions
      db.query(`
        SELECT action, COUNT(*) as count
        FROM audit_logs
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY action
        ORDER BY count DESC
        LIMIT 5
      `),

      // Top 5 des entités
      db.query(`
        SELECT target_entity, COUNT(*) as count
        FROM audit_logs
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY target_entity
        ORDER BY count DESC
        LIMIT 5
      `),
    ]);

    return {
      total_logs: parseInt(totalLogs.rows[0].total),
      today_logs: parseInt(todayLogs.rows[0].today),
      top_actions: topActions.rows,
      top_entities: topEntities.rows,
    };
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    throw error;
  }
}

module.exports = {
  logAdminAction,
  getAuditLogs,
  getAuditStats,
};
