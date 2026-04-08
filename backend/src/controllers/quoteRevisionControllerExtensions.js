/**
 * Extensions pour quoteRevisionController.js
 * Nouvelles fonctions pour la gestion complète des révisions de devis
 * À ajouter au fichier principal
 */

const db = require("../db");
const {
  sendQuoteEmail,
  sendQuoteUpdatedEmail,
} = require("../services/emailSimulationService");
const {
  logQuoteSent,
  logQuoteUpdated,
  logVehiclesModified,
  logAddonsModified,
  createToastNotification,
} = require("../services/adminNotificationService");

/**
 * @description Créer une nouvelle révision (modification d'un devis déjà envoyé)
 * @route POST /api/bookings/:bookingId/review/new-revision
 * @access Private (Admin only)
 */
exports.createNewRevision = async (req, res) => {
  const { bookingId } = req.params;
  const adminId = req.user.id;

  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // Trouver la révision active actuelle
    const currentRevisionResult = await client.query(
      `SELECT * FROM booking_quote_revisions
       WHERE booking_id = $1 AND review_status = 'sent'
       ORDER BY revision_number DESC LIMIT 1`,
      [bookingId]
    );

    if (currentRevisionResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        error: "No sent revision found for this booking",
      });
    }

    const currentRevision = currentRevisionResult.rows[0];
    const newRevisionNumber = currentRevision.revision_number + 1;

    // Marquer l'ancienne révision comme expirée et superseded
    await client.query(
      `UPDATE booking_quote_revisions
       SET review_status = 'expired',
           is_current_version = false,
           superseded_by = NULL,
           superseded_at = NOW()
       WHERE id = $1`,
      [currentRevision.id]
    );

    // Créer la nouvelle révision (copie de l'ancienne)
    const newRevisionResult = await client.query(
      `INSERT INTO booking_quote_revisions (
        booking_id,
        admin_id,
        revision_number,
        base_price,
        vehicles_price,
        addons_price,
        subtotal_price,
        discounts,
        total_discounts,
        additional_fees,
        total_fees,
        final_price,
        currency,
        vehicles_original,
        vehicles_adjusted,
        addons_original,
        addons_adjusted,
        tier_validated,
        vehicles_validated,
        addons_validated,
        participants_validated,
        dates_validated,
        review_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, 'draft'
      ) RETURNING *`,
      [
        bookingId,
        adminId,
        newRevisionNumber,
        currentRevision.base_price,
        currentRevision.vehicles_price,
        currentRevision.addons_price,
        currentRevision.subtotal_price,
        currentRevision.discounts,
        currentRevision.total_discounts,
        currentRevision.additional_fees,
        currentRevision.total_fees,
        currentRevision.final_price,
        currentRevision.currency,
        currentRevision.vehicles_original,
        currentRevision.vehicles_adjusted || currentRevision.vehicles_original,
        currentRevision.addons_original,
        currentRevision.addons_adjusted || currentRevision.addons_original,
        currentRevision.tier_validated,
        currentRevision.vehicles_validated,
        currentRevision.addons_validated,
        currentRevision.participants_validated,
        currentRevision.dates_validated,
      ]
    );

    // Mettre à jour l'ancienne révision avec la référence à la nouvelle
    await client.query(
      `UPDATE booking_quote_revisions
       SET superseded_by = $1
       WHERE id = $2`,
      [newRevisionResult.rows[0].id, currentRevision.id]
    );

    await client.query("COMMIT");

    // Logger l'activité
    await logQuoteUpdated(adminId, bookingId, newRevisionNumber);

    console.log(
      `✅ New revision (v${newRevisionNumber}) created for booking #${bookingId}`
    );

    res.status(201).json({
      success: true,
      message: `Revision ${newRevisionNumber} created successfully`,
      data: newRevisionResult.rows[0],
      toast: createToastNotification(
        "info",
        `Revision ${newRevisionNumber} created. Previous quote expired.`
      ),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating new revision:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  } finally {
    client.release();
  }
};

/**
 * @description Mettre à jour les véhicules avec quantités, prix et commentaires
 * @route PATCH /api/bookings/:bookingId/review/:revisionId/vehicles-detailed
 * @access Private (Admin only)
 */
exports.updateVehiclesDetailed = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const { vehicles_adjusted, vehicle_modifications_notes } = req.body;
  const adminId = req.user.id;

  try {
    // Vérifier que la révision appartient au booking
    const revisionCheck = await db.query(
      "SELECT booking_id FROM booking_quote_revisions WHERE id = $1",
      [revisionId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found",
      });
    }

    if (revisionCheck.rows[0].booking_id !== parseInt(bookingId)) {
      return res.status(400).json({
        success: false,
        error: "Revision does not belong to this booking",
      });
    }

    // Calculer le prix total des véhicules
    let vehiclesTotal = 0;
    if (vehicles_adjusted && Array.isArray(vehicles_adjusted)) {
      vehiclesTotal = vehicles_adjusted.reduce((sum, v) => {
        const quantity = v.adjusted_quantity || v.quantity || 1;
        const price = v.adjusted_price || v.price || v.original_price || 0;
        return sum + quantity * price;
      }, 0);
    }

    // Mettre à jour la révision
    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET vehicles_adjusted = $1,
           vehicle_modifications_notes = $2,
           vehicles_price = $3,
           vehicles_validated = true
       WHERE id = $4
       RETURNING *`,
      [
        JSON.stringify(vehicles_adjusted),
        vehicle_modifications_notes,
        vehiclesTotal,
        revisionId,
      ]
    );

    // Recalculer le prix total
    const revision = result.rows[0];
    const subtotal =
      (parseFloat(revision.base_price) || 0) +
      vehiclesTotal +
      (parseFloat(revision.addons_price) || 0);
    const finalPrice =
      subtotal -
      (parseFloat(revision.total_discounts) || 0) +
      (parseFloat(revision.total_fees) || 0);

    await db.query(
      `UPDATE booking_quote_revisions
       SET subtotal_price = $1, final_price = $2
       WHERE id = $3`,
      [subtotal, finalPrice, revisionId]
    );

    // Logger l'activité
    await logVehiclesModified(adminId, bookingId, {
      vehiclesCount: vehicles_adjusted?.length || 0,
      totalPrice: vehiclesTotal,
    });

    console.log(`✅ Vehicles updated for revision #${revisionId}`);

    res.status(200).json({
      success: true,
      message: "Vehicles updated successfully",
      data: {
        ...result.rows[0],
        subtotal_price: subtotal,
        final_price: finalPrice,
      },
      toast: createToastNotification(
        "success",
        "Vehicles updated successfully"
      ),
    });
  } catch (error) {
    console.error("Error updating vehicles:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * @description Mettre à jour les addons avec quantités, prix et commentaires
 * @route PATCH /api/bookings/:bookingId/review/:revisionId/addons-detailed
 * @access Private (Admin only)
 */
exports.updateAddonsDetailed = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const { addons_adjusted, addon_modifications_notes } = req.body;
  const adminId = req.user.id;

  try {
    // Vérifier que la révision appartient au booking
    const revisionCheck = await db.query(
      "SELECT booking_id FROM booking_quote_revisions WHERE id = $1",
      [revisionId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found",
      });
    }

    if (revisionCheck.rows[0].booking_id !== parseInt(bookingId)) {
      return res.status(400).json({
        success: false,
        error: "Revision does not belong to this booking",
      });
    }

    // Calculer le prix total des addons
    let addonsTotal = 0;
    if (addons_adjusted && Array.isArray(addons_adjusted)) {
      addonsTotal = addons_adjusted.reduce((sum, a) => {
        const quantity = a.adjusted_quantity || a.quantity || 1;
        const price = a.adjusted_price || a.price || a.original_price || 0;
        return sum + quantity * price;
      }, 0);
    }

    // Mettre à jour la révision
    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET addons_adjusted = $1,
           addon_modifications_notes = $2,
           addons_price = $3,
           addons_validated = true
       WHERE id = $4
       RETURNING *`,
      [
        JSON.stringify(addons_adjusted),
        addon_modifications_notes,
        addonsTotal,
        revisionId,
      ]
    );

    // Recalculer le prix total
    const revision = result.rows[0];
    const subtotal =
      (parseFloat(revision.base_price) || 0) +
      (parseFloat(revision.vehicles_price) || 0) +
      addonsTotal;
    const finalPrice =
      subtotal -
      (parseFloat(revision.total_discounts) || 0) +
      (parseFloat(revision.total_fees) || 0);

    await db.query(
      `UPDATE booking_quote_revisions
       SET subtotal_price = $1, final_price = $2
       WHERE id = $3`,
      [subtotal, finalPrice, revisionId]
    );

    // Logger l'activité
    await logAddonsModified(adminId, bookingId, {
      addonsCount: addons_adjusted?.length || 0,
      totalPrice: addonsTotal,
    });

    console.log(`✅ Add-ons updated for revision #${revisionId}`);

    res.status(200).json({
      success: true,
      message: "Add-ons updated successfully",
      data: {
        ...result.rows[0],
        subtotal_price: subtotal,
        final_price: finalPrice,
      },
      toast: createToastNotification("success", "Add-ons updated successfully"),
    });
  } catch (error) {
    console.error("Error updating addons:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * @description Générer les PDFs et envoyer le devis au client
 * @route POST /api/bookings/:bookingId/review/:revisionId/send-quote
 * @access Private (Admin only)
 */
exports.sendQuoteToCustomer = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const adminId = req.user.id;

  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // Vérifier que la révision existe et appartient au booking
    const revisionCheck = await client.query(
      "SELECT * FROM booking_quote_revisions WHERE id = $1 AND booking_id = $2",
      [revisionId, bookingId]
    );

    if (revisionCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        error: "Revision not found",
      });
    }

    console.log(`📧 Preparing quote for revision #${revisionId}...`);

    // Mettre à jour la révision (no more PDF paths)
    await client.query(
      `UPDATE booking_quote_revisions
       SET review_status = 'sent',
           is_current_version = true,
           quote_sent_at = NOW()
       WHERE id = $1`,
      [revisionId]
    );

    // Récupérer les infos du booking
    const bookingResult = await client.query(
      "SELECT user_id, contact_email, booking_reference FROM bookings WHERE id = $1",
      [bookingId]
    );

    const booking = bookingResult.rows[0];

    // Calculer la date d'expiration (48h)
    const expirationDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Mettre à jour le booking (no more PDF paths)
    await client.query(
      `UPDATE bookings
       SET status = 'Quote Sent',
           quote_sent_date = NOW(),
           quote_expiration_date = $1
       WHERE id = $2`,
      [expirationDate, bookingId]
    );

    await client.query("COMMIT");

    console.log(`📧 Sending quote email...`);

    // Envoyer l'email (simulé)
    try {
      await sendQuoteEmail(booking.user_id, bookingId, revisionId);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Continue même si l'email échoue
    }

    // Logger l'activité
    await logQuoteSent(adminId, bookingId, booking.contact_email);

    console.log(`✅ Quote sent successfully for booking #${bookingId}`);

    res.status(200).json({
      success: true,
      message: "Quote sent successfully to customer",
      data: {
        detailedPdf,
        generalPdf,
        expirationDate,
      },
      toast: createToastNotification(
        "success",
        `✅ Quote sent to ${booking.contact_email}`
      ),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error sending quote:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = exports;
