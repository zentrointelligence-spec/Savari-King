const { logAdminAction } = require("../services/auditLogService");

/**
 * Middleware d'audit automatique pour capturer les actions administratives
 * @param {string} action - Type d'action (CREATE, UPDATE, DELETE, etc.)
 * @param {string} entityType - Type d'entité (Tour, User, Vehicle, etc.)
 * @returns {Function} Middleware Express
 */
const auditMiddleware = (action, entityType) => {
  return (req, res, next) => {
    // Stocker les informations d'audit dans req pour utilisation ultérieure
    req.auditInfo = {
      action,
      entityType,
      adminId: req.user?.id,
      ipAddress:
        req.ip ||
        req.connection.remoteAddress ||
        req.headers["x-forwarded-for"],
      userAgent: req.get("User-Agent"),
    };

    // Intercepter la réponse pour logger après succès
    const originalSend = res.send;
    res.send = function (data) {
      // Logger seulement si l'opération a réussi (status 2xx)
      if (
        res.statusCode >= 200 &&
        res.statusCode < 300 &&
        req.auditInfo.adminId
      ) {
        // Extraire l'ID de l'entité depuis les paramètres ou le body de la réponse
        let entityId =
          req.params.id ||
          req.params.tourId ||
          req.params.userId ||
          req.params.vehicleId ||
          req.params.addonId ||
          req.params.reviewId ||
          req.params.resetId;

        // Si pas d'ID dans les paramètres, essayer de l'extraire de la réponse
        if (!entityId && data) {
          try {
            const responseData = JSON.parse(data);
            entityId = responseData.id || responseData.data?.id;
          } catch (e) {
            // Ignore parsing errors
          }
        }

        // Préparer les détails de l'audit
        const details = {
          endpoint: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString(),
        };

        // Ajouter des détails spécifiques selon l'action
        if (req.body && Object.keys(req.body).length > 0) {
          // Ne pas logger les mots de passe ou tokens sensibles
          const sanitizedBody = { ...req.body };
          delete sanitizedBody.password;
          delete sanitizedBody.token;
          delete sanitizedBody.reset_token;

          details.requestBody = sanitizedBody;
        }

        // Logger l'action
        logAdminAction(
          req.auditInfo.adminId,
          req.auditInfo.action,
          req.auditInfo.entityType,
          entityId,
          details,
          req.auditInfo.ipAddress,
          req.auditInfo.userAgent
        ).catch((error) => {
          console.error("Failed to log audit action:", error);
        });
      }

      // Appeler la méthode send originale
      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Middleware pour logger les connexions/déconnexions admin
 */
const auditAuthMiddleware = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || (req.body?.email ? "unknown" : null);

        if (userId) {
          const details = {
            endpoint: req.originalUrl,
            method: req.method,
            email: req.body?.email || req.user?.email,
            timestamp: new Date().toISOString(),
          };

          logAdminAction(
            userId === "unknown" ? null : userId,
            action,
            "User",
            userId === "unknown" ? null : userId,
            details,
            req.ip ||
              req.connection.remoteAddress ||
              req.headers["x-forwarded-for"],
            req.get("User-Agent")
          ).catch((error) => {
            console.error("Failed to log auth action:", error);
          });
        }
      }

      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Fonction helper pour logger manuellement une action avec contexte de requête
 * @param {Object} req - Objet request Express
 * @param {string} action - Action à logger
 * @param {string} entityType - Type d'entité
 * @param {number} entityId - ID de l'entité
 * @param {Object} additionalDetails - Détails supplémentaires
 */
const logActionWithContext = async (
  req,
  action,
  entityType,
  entityId,
  additionalDetails = {}
) => {
  if (!req.user?.id) {
    console.warn("Cannot log audit action: no user in request");
    return;
  }

  const details = {
    endpoint: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...additionalDetails,
  };

  try {
    await logAdminAction(
      req.user.id,
      action,
      entityType,
      entityId,
      details,
      req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"],
      req.get("User-Agent")
    );
  } catch (error) {
    console.error("Failed to log action with context:", error);
  }
};

module.exports = {
  auditMiddleware,
  auditAuthMiddleware,
  logActionWithContext,
};
