const db = require("../db");
const { logUserActivity } = require("../services/activityService");
const { runFullValidation } = require("../services/quoteValidationService");
const { calculateQuotePrice } = require("../services/quotePricingService");
const { sendDetailedQuoteEmail } = require("../services/quoteRevisionEmailService");

// ============================================================================
// HELPER FUNCTIONS - Enrich vehicles and addons with full database details
// ============================================================================

/**
 * Enrich vehicles array with full details from vehicles table
 * @param {Array} vehicles - Array of vehicle objects with vehicle_id
 * @returns {Array} Enriched vehicles with name, capacity, price, etc.
 */
async function enrichVehiclesData(vehicles) {
  if (!vehicles || !Array.isArray(vehicles)) {
    return vehicles;
  }

  return await Promise.all(
    vehicles.map(async (selectedVehicle) => {
      if (selectedVehicle.vehicle_id) {
        try {
          const vehicleResult = await db.query(
            'SELECT id, name, capacity, base_price_inr FROM vehicles WHERE id = $1',
            [selectedVehicle.vehicle_id]
          );

          if (vehicleResult.rows.length > 0) {
            const vehicleData = vehicleResult.rows[0];
            return {
              vehicle_id: selectedVehicle.vehicle_id,
              name: vehicleData.name,
              vehicle_name: vehicleData.name,
              quantity: selectedVehicle.quantity || 1,
              adjusted_quantity: selectedVehicle.adjusted_quantity || selectedVehicle.quantity || 1,
              capacity: vehicleData.capacity,
              price: parseFloat(vehicleData.base_price_inr),
              adjusted_price: selectedVehicle.adjusted_price ? parseFloat(selectedVehicle.adjusted_price) : parseFloat(vehicleData.base_price_inr),
              original_price: parseFloat(vehicleData.base_price_inr)
            };
          }
        } catch (err) {
          console.error(`Error fetching vehicle ${selectedVehicle.vehicle_id}:`, err);
        }
      }
      // Fallback if vehicle not found or no vehicle_id
      return selectedVehicle;
    })
  );
}

/**
 * Enrich addons array with full details from addons table
 * @param {Array} addons - Array of addon objects with addon_id
 * @returns {Array} Enriched addons with name, price, etc.
 */
async function enrichAddonsData(addons) {
  if (!addons || !Array.isArray(addons)) {
    return addons;
  }

  return await Promise.all(
    addons.map(async (selectedAddon) => {
      if (selectedAddon.addon_id) {
        try {
          const addonResult = await db.query(
            'SELECT id, name, price FROM addons WHERE id = $1',
            [selectedAddon.addon_id]
          );

          if (addonResult.rows.length > 0) {
            const addonData = addonResult.rows[0];
            return {
              addon_id: selectedAddon.addon_id,
              name: addonData.name,
              addon_name: addonData.name,
              quantity: selectedAddon.quantity || 1,
              adjusted_quantity: selectedAddon.adjusted_quantity || selectedAddon.quantity || 1,
              price: parseFloat(addonData.price),
              adjusted_price: selectedAddon.adjusted_price ? parseFloat(selectedAddon.adjusted_price) : parseFloat(addonData.price),
              original_price: parseFloat(addonData.price)
            };
          }
        } catch (err) {
          console.error(`Error fetching addon ${selectedAddon.addon_id}:`, err);
        }
      }
      // Fallback if addon not found or no addon_id
      return selectedAddon;
    })
  );
}

// ============================================================================
// CONTROLLER FUNCTIONS
// ============================================================================

/**
 * @description Start a new quote review for a booking
 * @route POST /api/bookings/:bookingId/review/start
 * @access Private (Admin only)
 */
exports.startBookingReview = async (req, res) => {
  const { bookingId } = req.params;
  const adminId = req.user.id;

  try {
    // Call the database function to start review
    const result = await db.query(
      'SELECT * FROM start_booking_review($1, $2)',
      [bookingId, adminId]
    );

    const { success, message, revision_id } = result.rows[0];

    if (!success) {
      return res.status(400).json({
        success: false,
        error: message
      });
    }

    // Log activity
    await logUserActivity(adminId, "Started Quote Review", { bookingId, revisionId: revision_id });

    res.status(200).json({
      success: true,
      message,
      data: {
        revisionId: revision_id
      }
    });
  } catch (error) {
    console.error(`Error starting review for booking #${bookingId}:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Get the active revision for a booking
 * @route GET /api/bookings/:bookingId/review/active
 * @access Private (Admin only)
 */
exports.getActiveRevision = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM active_quote_revisions WHERE booking_id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No active revision found for this booking"
      });
    }

    const revision = result.rows[0];

    // Enrich vehicles_original with full details
    if (revision.vehicles_original) {
      revision.vehicles_original = await enrichVehiclesData(revision.vehicles_original);
    }

    // Enrich vehicles_adjusted with full details
    if (revision.vehicles_adjusted && revision.vehicles_adjusted.length > 0) {
      revision.vehicles_adjusted = await enrichVehiclesData(revision.vehicles_adjusted);
    }

    // Enrich addons_original with full details
    if (revision.addons_original) {
      revision.addons_original = await enrichAddonsData(revision.addons_original);
    }

    // Enrich addons_adjusted with full details
    if (revision.addons_adjusted && revision.addons_adjusted.length > 0) {
      revision.addons_adjusted = await enrichAddonsData(revision.addons_adjusted);
    }

    res.status(200).json({
      success: true,
      data: revision
    });
  } catch (error) {
    console.error(`Error fetching active revision for booking #${bookingId}:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Get the latest revision for a booking (regardless of status)
 * @route GET /api/bookings/:bookingId/review/latest
 * @access Private (Admin only)
 */
exports.getLatestRevision = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM booking_quote_revisions
       WHERE booking_id = $1
       ORDER BY revision_number DESC
       LIMIT 1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No revision found for this booking"
      });
    }

    const revision = result.rows[0];

    // Enrich vehicles_original with full details
    if (revision.vehicles_original) {
      revision.vehicles_original = await enrichVehiclesData(revision.vehicles_original);
    }

    // Enrich vehicles_adjusted with full details
    if (revision.vehicles_adjusted && revision.vehicles_adjusted.length > 0) {
      revision.vehicles_adjusted = await enrichVehiclesData(revision.vehicles_adjusted);
    }

    // Enrich addons_original with full details
    if (revision.addons_original) {
      revision.addons_original = await enrichAddonsData(revision.addons_original);
    }

    // Enrich addons_adjusted with full details
    if (revision.addons_adjusted && revision.addons_adjusted.length > 0) {
      revision.addons_adjusted = await enrichAddonsData(revision.addons_adjusted);
    }

    res.status(200).json({
      success: true,
      data: revision
    });
  } catch (error) {
    console.error(`Error fetching latest revision for booking #${bookingId}:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Get all revisions for a booking (history)
 * @route GET /api/bookings/:bookingId/review/history
 * @access Private (Admin only)
 */
exports.getRevisionHistory = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM quote_revision_history WHERE booking_id = $1 ORDER BY created_at DESC`,
      [bookingId]
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(`Error fetching revision history for booking #${bookingId}:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Update tier validation section
 * @route PATCH /api/bookings/:bookingId/review/:revisionId/tier
 * @access Private (Admin only)
 */
exports.updateTierValidation = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const {
    tier_validated,
    tier_adjusted_price,
    tier_adjustment_reason,
    tier_notes,
    tier_availability_confirmed,
    new_tier_id,
    new_num_adults,
    new_num_children,
    new_participant_ages  // Array of participant age objects for JSONB storage
  } = req.body;

  try {
    // Verify revision belongs to booking
    const revisionCheck = await db.query(
      'SELECT booking_id FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found"
      });
    }

    if (revisionCheck.rows[0].booking_id !== parseInt(bookingId)) {
      return res.status(400).json({
        success: false,
        error: "Revision does not belong to this booking"
      });
    }

    // Get current booking info
    const bookingResult = await db.query(
      'SELECT tier_id, num_adults, num_children, participant_ages FROM bookings WHERE id = $1',
      [bookingId]
    );
    const currentBooking = bookingResult.rows[0];

    // Determine final tier_id and participant counts
    const finalTierId = new_tier_id || currentBooking.tier_id;
    const finalNumAdults = new_num_adults !== null && new_num_adults !== undefined ? new_num_adults : currentBooking.num_adults;
    const finalNumChildren = new_num_children !== null && new_num_children !== undefined ? new_num_children : currentBooking.num_children;
    const finalParticipantAges = new_participant_ages || currentBooking.participant_ages;
    const totalPeople = finalNumAdults + finalNumChildren;

    // If tier changed, recalculate base price using price per person
    // IMPORTANT: Convert to number to avoid string concatenation
    let finalAdjustedPrice = tier_adjusted_price ? parseFloat(tier_adjusted_price) : null;

    if (new_tier_id) {
      // Get tier price per person from packagetiers
      const tierResult = await db.query(
        'SELECT price FROM packagetiers WHERE id = $1',
        [finalTierId]
      );

      if (tierResult.rows.length > 0) {
        // Calculate total price: price per person × number of participants
        const pricePerPerson = parseFloat(tierResult.rows[0].price || 0);
        finalAdjustedPrice = pricePerPerson * totalPeople;

        console.log(`🔄 TIER CHANGED - UPDATING BASE PRICE:`);
        console.log(`   Tier ID: ${finalTierId}`);
        console.log(`   Price Per Person: ₹${pricePerPerson}`);
        console.log(`   Participants: ${totalPeople} (Adults: ${finalNumAdults}, Children: ${finalNumChildren})`);
        console.log(`   CALCULATION: ₹${pricePerPerson} × ${totalPeople} people`);
        console.log(`   NEW BASE PRICE: ₹${finalAdjustedPrice}`);
      }

      // Update booking if tier or participants changed
      if (new_tier_id || new_num_adults !== null || new_num_children !== null || new_participant_ages) {
        await db.query(
          `UPDATE bookings
           SET tier_id = COALESCE($1, tier_id),
               num_adults = COALESCE($2, num_adults),
               num_children = COALESCE($3, num_children),
               participant_ages = COALESCE($4, participant_ages)
           WHERE id = $5`,
          [
            new_tier_id,
            new_num_adults,
            new_num_children,
            new_participant_ages ? JSON.stringify(new_participant_ages) : null,
            bookingId
          ]
        );
      }
    } else if (new_num_adults !== null || new_num_children !== null || new_participant_ages) {
      // Only participants changed, NOT tier - keep current base price
      console.log(`👥 PARTICIPANTS UPDATED (tier unchanged):`);
      console.log(`   New Adults: ${finalNumAdults}, New Children: ${finalNumChildren}`);
      console.log(`   Base price remains: ₹${finalAdjustedPrice || tier_adjusted_price}`);

      // Update booking participants only
      await db.query(
        `UPDATE bookings
         SET num_adults = COALESCE($1, num_adults),
             num_children = COALESCE($2, num_children),
             participant_ages = COALESCE($3, participant_ages)
         WHERE id = $4`,
        [
          new_num_adults,
          new_num_children,
          new_participant_ages ? JSON.stringify(new_participant_ages) : null,
          bookingId
        ]
      );
    }

    // Update tier validation fields
    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET tier_validated = COALESCE($1, tier_validated),
           tier_adjusted_price = COALESCE($2, tier_adjusted_price),
           base_price = COALESCE($2, base_price),
           tier_adjustment_reason = COALESCE($3, tier_adjustment_reason),
           tier_notes = COALESCE($4, tier_notes),
           tier_availability_confirmed = COALESCE($5, tier_availability_confirmed)
       WHERE id = $6
       RETURNING *`,
      [
        tier_validated,
        finalAdjustedPrice,
        tier_adjustment_reason,
        tier_notes,
        tier_availability_confirmed,
        revisionId
      ]
    );

    // Recalculate final price with updated base price
    const revision = result.rows[0];
    const basePrice = parseFloat(revision.base_price || 0);
    const vehiclesPrice = parseFloat(revision.vehicles_price || 0);
    const addonsPrice = parseFloat(revision.addons_price || 0);
    const totalDiscounts = parseFloat(revision.total_discounts || 0);
    const totalFees = parseFloat(revision.total_fees || 0);

    // All values must be numbers for proper calculation
    const newFinalPrice = basePrice + vehiclesPrice + addonsPrice - totalDiscounts + totalFees;

    // Update final price
    const subtotalPrice = basePrice + vehiclesPrice + addonsPrice;
    await db.query(
      `UPDATE booking_quote_revisions
       SET final_price = $1,
           subtotal_price = $2
       WHERE id = $3`,
      [newFinalPrice, subtotalPrice, revisionId]
    );

    // Calculate validation score
    await db.query('SELECT calculate_revision_validation_score($1)', [revisionId]);

    // Fetch updated revision
    const updatedResult = await db.query(
      'SELECT * FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    res.status(200).json({
      success: true,
      message: "Tier validation updated successfully. Base price and final price recalculated.",
      data: updatedResult.rows[0]
    });
  } catch (error) {
    console.error(`Error updating tier validation:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message
    });
  }
};

/**
 * @description Update vehicles validation section
 * @route PATCH /api/bookings/:bookingId/review/:revisionId/vehicles
 * @access Private (Admin only)
 */
exports.updateVehiclesValidation = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const {
    vehicles_validated,
    vehicles_adjusted,
    vehicles_total_capacity,
    vehicles_capacity_sufficient,
    vehicles_availability_confirmed,
    vehicles_notes
  } = req.body;

  try {
    // Verify revision belongs to booking
    const revisionCheck = await db.query(
      'SELECT booking_id FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found"
      });
    }

    if (revisionCheck.rows[0].booking_id !== parseInt(bookingId)) {
      return res.status(400).json({
        success: false,
        error: "Revision does not belong to this booking"
      });
    }

    // Update vehicles validation fields
    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET vehicles_validated = COALESCE($1, vehicles_validated),
           vehicles_adjusted = COALESCE($2, vehicles_adjusted),
           vehicles_total_capacity = COALESCE($3, vehicles_total_capacity),
           vehicles_capacity_sufficient = COALESCE($4, vehicles_capacity_sufficient),
           vehicles_availability_confirmed = COALESCE($5, vehicles_availability_confirmed),
           vehicles_notes = COALESCE($6, vehicles_notes)
       WHERE id = $7
       RETURNING *`,
      [
        vehicles_validated,
        vehicles_adjusted ? JSON.stringify(vehicles_adjusted) : null,
        vehicles_total_capacity,
        vehicles_capacity_sufficient,
        vehicles_availability_confirmed,
        vehicles_notes,
        revisionId
      ]
    );

    // Calculate validation score
    await db.query('SELECT calculate_revision_validation_score($1)', [revisionId]);

    res.status(200).json({
      success: true,
      message: "Vehicles validation updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`Error updating vehicles validation:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Update add-ons validation section
 * @route PATCH /api/bookings/:bookingId/review/:revisionId/addons
 * @access Private (Admin only)
 */
exports.updateAddonsValidation = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const {
    addons_validated,
    addons_adjusted,
    addons_availability_confirmed,
    addons_conflicts,
    addons_suggestions,
    addons_notes
  } = req.body;

  try {
    // Verify revision belongs to booking
    const revisionCheck = await db.query(
      'SELECT booking_id FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found"
      });
    }

    if (revisionCheck.rows[0].booking_id !== parseInt(bookingId)) {
      return res.status(400).json({
        success: false,
        error: "Revision does not belong to this booking"
      });
    }

    // Update add-ons validation fields
    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET addons_validated = COALESCE($1, addons_validated),
           addons_adjusted = COALESCE($2, addons_adjusted),
           addons_availability_confirmed = COALESCE($3, addons_availability_confirmed),
           addons_conflicts = COALESCE($4, addons_conflicts),
           addons_suggestions = COALESCE($5, addons_suggestions),
           addons_notes = COALESCE($6, addons_notes)
       WHERE id = $7
       RETURNING *`,
      [
        addons_validated,
        addons_adjusted ? JSON.stringify(addons_adjusted) : null,
        addons_availability_confirmed,
        addons_conflicts ? JSON.stringify(addons_conflicts) : null,
        addons_suggestions ? JSON.stringify(addons_suggestions) : null,
        addons_notes,
        revisionId
      ]
    );

    // Calculate validation score
    await db.query('SELECT calculate_revision_validation_score($1)', [revisionId]);

    res.status(200).json({
      success: true,
      message: "Add-ons validation updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`Error updating add-ons validation:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Update participants validation section
 * @route PATCH /api/bookings/:bookingId/review/:revisionId/participants
 * @access Private (Admin only)
 */
exports.updateParticipantsValidation = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const {
    participants_validated,
    age_requirements_met,
    age_violations,
    capacity_requirements_met,
    max_capacity_exceeded,
    participants_notes
  } = req.body;

  try {
    // Verify revision belongs to booking
    const revisionCheck = await db.query(
      'SELECT booking_id FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found"
      });
    }

    if (revisionCheck.rows[0].booking_id !== parseInt(bookingId)) {
      return res.status(400).json({
        success: false,
        error: "Revision does not belong to this booking"
      });
    }

    // Update participants validation fields
    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET participants_validated = COALESCE($1, participants_validated),
           age_requirements_met = COALESCE($2, age_requirements_met),
           age_violations = COALESCE($3, age_violations),
           capacity_requirements_met = COALESCE($4, capacity_requirements_met),
           max_capacity_exceeded = COALESCE($5, max_capacity_exceeded),
           participants_notes = COALESCE($6, participants_notes)
       WHERE id = $7
       RETURNING *`,
      [
        participants_validated,
        age_requirements_met,
        age_violations ? JSON.stringify(age_violations) : null,
        capacity_requirements_met,
        max_capacity_exceeded,
        participants_notes,
        revisionId
      ]
    );

    // Calculate validation score
    await db.query('SELECT calculate_revision_validation_score($1)', [revisionId]);

    res.status(200).json({
      success: true,
      message: "Participants validation updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`Error updating participants validation:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Update dates validation section
 * @route PATCH /api/bookings/:bookingId/review/:revisionId/dates
 * @access Private (Admin only)
 */
exports.updateDatesValidation = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const {
    dates_validated,
    seasonal_pricing_applied,
    seasonal_pricing_details,
    dates_notes
  } = req.body;

  try {
    // Verify revision belongs to booking
    const revisionCheck = await db.query(
      'SELECT booking_id FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found"
      });
    }

    if (revisionCheck.rows[0].booking_id !== parseInt(bookingId)) {
      return res.status(400).json({
        success: false,
        error: "Revision does not belong to this booking"
      });
    }

    // Update dates validation fields
    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET dates_validated = COALESCE($1, dates_validated),
           seasonal_pricing_applied = COALESCE($2, seasonal_pricing_applied),
           seasonal_pricing_details = COALESCE($3, seasonal_pricing_details),
           dates_notes = COALESCE($4, dates_notes)
       WHERE id = $5
       RETURNING *`,
      [
        dates_validated,
        seasonal_pricing_applied,
        seasonal_pricing_details ? JSON.stringify(seasonal_pricing_details) : null,
        dates_notes,
        revisionId
      ]
    );

    // Calculate validation score
    await db.query('SELECT calculate_revision_validation_score($1)', [revisionId]);

    res.status(200).json({
      success: true,
      message: "Dates validation updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`Error updating dates validation:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Update pricing (discounts and fees)
 * @route PATCH /api/bookings/:bookingId/review/:revisionId/pricing
 * @access Private (Admin only)
 */
exports.updatePricing = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const {
    base_price,
    vehicles_price,
    addons_price,
    discounts,
    total_discounts,
    additional_fees,
    total_fees,
    final_price
  } = req.body;

  try {
    // Verify revision belongs to booking
    const revisionCheck = await db.query(
      'SELECT booking_id FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found"
      });
    }

    if (revisionCheck.rows[0].booking_id !== parseInt(bookingId)) {
      return res.status(400).json({
        success: false,
        error: "Revision does not belong to this booking"
      });
    }

    // Calculate subtotal if needed
    const subtotal = (base_price || 0) + (vehicles_price || 0) + (addons_price || 0);

    // Update pricing fields in revision
    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET base_price = COALESCE($1, base_price),
           vehicles_price = COALESCE($2, vehicles_price),
           addons_price = COALESCE($3, addons_price),
           subtotal_price = $4,
           discounts = COALESCE($5, discounts),
           total_discounts = COALESCE($6, total_discounts),
           additional_fees = COALESCE($7, additional_fees),
           total_fees = COALESCE($8, total_fees),
           final_price = COALESCE($9, final_price)
       WHERE id = $10
       RETURNING *`,
      [
        base_price,
        vehicles_price,
        addons_price,
        subtotal,
        discounts ? JSON.stringify(discounts) : null,
        total_discounts,
        additional_fees ? JSON.stringify(additional_fees) : null,
        total_fees,
        final_price,
        revisionId
      ]
    );

    // Also update the final_price in the bookings table
    // This ensures the price shown in Admin Bookings list is up-to-date
    await db.query(
      `UPDATE bookings
       SET final_price = $1
       WHERE id = $2`,
      [final_price, bookingId]
    );

    res.status(200).json({
      success: true,
      message: "Pricing updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`Error updating pricing:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Add a discount to the revision
 * @route POST /api/bookings/:bookingId/review/:revisionId/discounts
 * @access Private (Admin only)
 */
exports.addDiscount = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const { type, name, amount, percentage, reason, auto_applied = false } = req.body;

  if (!type || !name || (!amount && !percentage)) {
    return res.status(400).json({
      success: false,
      error: "Type, name, and either amount or percentage are required"
    });
  }

  try {
    // Get current discounts
    const current = await db.query(
      'SELECT discounts, total_discounts FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found"
      });
    }

    const currentDiscounts = current.rows[0].discounts || [];
    const currentTotal = parseFloat(current.rows[0].total_discounts || 0);

    // Create new discount object
    const newDiscount = {
      id: `disc_${Date.now()}`,
      type,
      name,
      amount: amount || 0,
      percentage: percentage || null,
      reason,
      auto_applied,
      created_at: new Date().toISOString()
    };

    // Add to discounts array
    const updatedDiscounts = [...currentDiscounts, newDiscount];
    const newTotal = currentTotal + (amount || 0);

    // Update revision
    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET discounts = $1, total_discounts = $2
       WHERE id = $3
       RETURNING *`,
      [JSON.stringify(updatedDiscounts), newTotal, revisionId]
    );

    res.status(200).json({
      success: true,
      message: "Discount added successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`Error adding discount:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Add an additional fee to the revision
 * @route POST /api/bookings/:bookingId/review/:revisionId/fees
 * @access Private (Admin only)
 */
exports.addFee = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const { type, name, amount, percentage, reason, auto_applied = false } = req.body;

  if (!type || !name || (!amount && !percentage)) {
    return res.status(400).json({
      success: false,
      error: "Type, name, and either amount or percentage are required"
    });
  }

  try {
    // Get current fees
    const current = await db.query(
      'SELECT additional_fees, total_fees FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found"
      });
    }

    const currentFees = current.rows[0].additional_fees || [];
    const currentTotal = parseFloat(current.rows[0].total_fees || 0);

    // Create new fee object
    const newFee = {
      id: `fee_${Date.now()}`,
      type,
      name,
      amount: amount || 0,
      percentage: percentage || null,
      reason,
      auto_applied,
      created_at: new Date().toISOString()
    };

    // Add to fees array
    const updatedFees = [...currentFees, newFee];
    const newTotal = currentTotal + (amount || 0);

    // Update revision
    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET additional_fees = $1, total_fees = $2
       WHERE id = $3
       RETURNING *`,
      [JSON.stringify(updatedFees), newTotal, revisionId]
    );

    res.status(200).json({
      success: true,
      message: "Fee added successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`Error adding fee:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Update review status
 * @route PATCH /api/bookings/:bookingId/review/:revisionId/status
 * @access Private (Admin only)
 */
exports.updateReviewStatus = async (req, res) => {
  const { bookingId, revisionId } = req.params;
  const { review_status, internal_notes, customer_message, rejection_reason } = req.body;

  if (!review_status) {
    return res.status(400).json({
      success: false,
      error: "Review status is required"
    });
  }

  const validStatuses = ['draft', 'in_review', 'validated', 'approved', 'rejected', 'sent'];
  if (!validStatuses.includes(review_status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {
    // Build dynamic query based on status
    let additionalFields = '';
    const params = [review_status];
    let paramIndex = 2;

    if (review_status === 'validated') {
      additionalFields += `, review_completed_at = NOW()`;
    } else if (review_status === 'approved') {
      additionalFields += `, approved_at = NOW(), ready_to_send = true`;
    } else if (review_status === 'rejected') {
      additionalFields += `, rejected_at = NOW()`;
    } else if (review_status === 'sent') {
      additionalFields += `, quote_sent_at = NOW()`;
    }

    if (internal_notes !== undefined) {
      additionalFields += `, internal_notes = $${paramIndex}`;
      params.push(internal_notes);
      paramIndex++;
    }

    if (customer_message !== undefined) {
      additionalFields += `, customer_message = $${paramIndex}`;
      params.push(customer_message);
      paramIndex++;
    }

    if (rejection_reason !== undefined) {
      additionalFields += `, rejection_reason = $${paramIndex}`;
      params.push(rejection_reason);
      paramIndex++;
    }

    params.push(revisionId);

    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET review_status = $1${additionalFields}
       WHERE id = $${paramIndex}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Revision not found"
      });
    }

    // If approved or sent, update the booking status and send email
    if (review_status === 'approved' || review_status === 'sent') {
      await db.query(
        `UPDATE bookings SET status = 'Quote Sent', final_price = $1, quote_sent_date = NOW()
         WHERE id = $2`,
        [result.rows[0].final_price, bookingId]
      );

      // Send detailed quote email to customer
      if (review_status === 'sent') {
        try {
          await sendDetailedQuoteEmail(bookingId, revisionId);
        } catch (emailError) {
          console.error('Error sending quote email:', emailError);
          // Continue even if email fails - quote is still marked as sent
        }
      }
    }

    // If rejected, revert booking to Inquiry Pending
    if (review_status === 'rejected') {
      await db.query(
        `UPDATE bookings SET status = 'Inquiry Pending' WHERE id = $1`,
        [bookingId]
      );
    }

    res.status(200).json({
      success: true,
      message: `Review status updated to ${review_status}`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`Error updating review status:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Get all active reviews (admin dashboard)
 * @route GET /api/admin/reviews/active
 * @access Private (Admin only)
 */
exports.getAllActiveReviews = async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  try {
    const result = await db.query(
      `SELECT * FROM active_quote_revisions
       ORDER BY review_started_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM active_quote_revisions`
    );

    res.status(200).json({
      success: true,
      data: {
        reviews: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error("Error fetching active reviews:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Run automatic validation on a booking
 * @route POST /api/bookings/:bookingId/review/validate
 * @access Private (Admin only)
 */
exports.runAutoValidation = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const validationResult = await runFullValidation(bookingId);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }

    res.status(200).json({
      success: true,
      data: validationResult
    });
  } catch (error) {
    console.error(`Error running auto-validation for booking #${bookingId}:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Calculate quote pricing for a booking
 * @route POST /api/bookings/:bookingId/review/calculate-price
 * @access Private (Admin only)
 */
exports.calculatePrice = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const pricingResult = await calculateQuotePrice(bookingId);

    if (!pricingResult.success) {
      return res.status(400).json({
        success: false,
        error: pricingResult.error
      });
    }

    res.status(200).json({
      success: true,
      data: pricingResult
    });
  } catch (error) {
    console.error(`Error calculating price for booking #${bookingId}:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * @description Run full validation and save results to a revision
 * @route POST /api/bookings/:bookingId/review/:revisionId/auto-validate
 * @access Private (Admin only)
 */
exports.runAutoValidationAndSave = async (req, res) => {
  const { bookingId, revisionId } = req.params;

  try {
    // Get booking details with enriched vehicles and addons
    const bookingResult = await db.query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    // Enrich vehicles
    let enrichedVehicles = [];
    if (booking.selected_vehicles && Array.isArray(booking.selected_vehicles)) {
      enrichedVehicles = await Promise.all(
        booking.selected_vehicles.map(async (vehicle) => {
          if (vehicle.vehicle_id) {
            const vResult = await db.query(
              'SELECT id, name, capacity, base_price_inr FROM vehicles WHERE id = $1',
              [vehicle.vehicle_id]
            );
            if (vResult.rows.length > 0) {
              const vData = vResult.rows[0];
              return {
                vehicle_id: vehicle.vehicle_id,
                name: vData.name,
                quantity: vehicle.quantity || 1,
                capacity: vData.capacity,
                price: parseFloat(vData.base_price_inr),
                total_price: parseFloat(vData.base_price_inr) * (vehicle.quantity || 1)
              };
            }
          }
          return vehicle;
        })
      );
    }

    // Enrich addons
    let enrichedAddons = [];
    if (booking.selected_addons && Array.isArray(booking.selected_addons)) {
      enrichedAddons = await Promise.all(
        booking.selected_addons.map(async (addon) => {
          if (addon.addon_id) {
            const aResult = await db.query(
              'SELECT id, name, price, description FROM addons WHERE id = $1',
              [addon.addon_id]
            );
            if (aResult.rows.length > 0) {
              const aData = aResult.rows[0];
              return {
                addon_id: addon.addon_id,
                name: aData.name,
                quantity: addon.quantity || 1,
                price: parseFloat(aData.price),
                total_price: parseFloat(aData.price) * (addon.quantity || 1),
                description: aData.description
              };
            }
          }
          return addon;
        })
      );
    }

    // Run validation
    const validationResult = await runFullValidation(bookingId);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }

    // Run pricing calculation
    const pricingResult = await calculateQuotePrice(bookingId);

    if (!pricingResult.success) {
      return res.status(400).json({
        success: false,
        error: pricingResult.error
      });
    }

    // Determine validation flags from results
    const tierValidated = validationResult.tier_validation?.available || false;
    const vehiclesValidated = validationResult.vehicles_validation?.validated || false;
    const addonsValidated = validationResult.addons_validation?.validated || false;
    const participantsValidated = validationResult.participants_validation?.validated || false;
    const datesValidated = validationResult.date_validation?.validated || false;
    const allSectionsValidated = tierValidated && vehiclesValidated && addonsValidated && participantsValidated && datesValidated;

    // Update revision with validation and pricing results (including special offers)
    await db.query(
      `UPDATE booking_quote_revisions
       SET auto_validation_results = $1,
           validation_score = $2,
           tier_validated = $3,
           tier_availability_confirmed = $4,
           vehicles_validated = $5,
           vehicles_original = $6,
           vehicles_adjusted = $7,
           vehicles_availability_confirmed = $8,
           vehicles_capacity_sufficient = $9,
           vehicles_total_capacity = $10,
           addons_validated = $11,
           addons_original = $12,
           addons_adjusted = $13,
           addons_availability_confirmed = $14,
           participants_validated = $15,
           dates_validated = $16,
           all_sections_validated = $17,
           base_price = $18,
           vehicles_price = $19,
           addons_price = $20,
           subtotal_price = $21,
           discounts = $22,
           total_discounts = $23,
           additional_fees = $24,
           total_fees = $25,
           final_price = $26,
           applied_offers = $27
       WHERE id = $28`,
      [
        JSON.stringify(validationResult),
        validationResult.validation_score,
        tierValidated,
        validationResult.tier_validation?.available || false,
        vehiclesValidated,
        JSON.stringify(enrichedVehicles),
        JSON.stringify(enrichedVehicles), // Initially, adjusted = original
        validationResult.vehicles_validation?.availability_confirmed || false,
        validationResult.vehicles_validation?.capacity_sufficient || false,
        validationResult.vehicles_validation?.total_capacity || 0,
        addonsValidated,
        JSON.stringify(enrichedAddons),
        JSON.stringify(enrichedAddons), // Initially, adjusted = original
        validationResult.addons_validation?.validated || false,
        participantsValidated,
        datesValidated,
        allSectionsValidated,
        pricingResult.pricing.base_price,
        pricingResult.pricing.vehicles_price,
        pricingResult.pricing.addons_price,
        pricingResult.pricing.subtotal_price,
        JSON.stringify(pricingResult.pricing.discounts),
        pricingResult.pricing.total_discounts,
        JSON.stringify(pricingResult.pricing.additional_fees),
        pricingResult.pricing.total_fees,
        pricingResult.pricing.final_price,
        JSON.stringify(pricingResult.pricing.special_offers_applied || []),
        revisionId
      ]
    );

    // Get updated revision
    const updatedRevision = await db.query(
      'SELECT * FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    res.status(200).json({
      success: true,
      message: "Auto-validation and pricing completed successfully",
      data: {
        revision: updatedRevision.rows[0],
        validation: validationResult,
        pricing: pricingResult
      }
    });
  } catch (error) {
    console.error(`Error running auto-validation and save:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

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
    await client.query('BEGIN');

    // Trouver la révision active actuelle
    const currentRevisionResult = await client.query(
      `SELECT * FROM booking_quote_revisions
       WHERE booking_id = $1 AND review_status = 'sent'
       ORDER BY revision_number DESC LIMIT 1`,
      [bookingId]
    );

    if (currentRevisionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'No sent revision found for this booking'
      });
    }

    const currentRevision = currentRevisionResult.rows[0];
    const newRevisionNumber = currentRevision.revision_number + 1;

    // Marquer l'ancienne révision comme expirée
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
        booking_id, admin_id, revision_number, base_price, vehicles_price,
        addons_price, subtotal_price, discounts, total_discounts,
        additional_fees, total_fees, final_price, currency,
        vehicles_original, vehicles_adjusted, addons_original, addons_adjusted,
        tier_validated, vehicles_validated, addons_validated,
        participants_validated, dates_validated, review_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, 'draft'
      ) RETURNING *`,
      [
        bookingId, adminId, newRevisionNumber,
        currentRevision.base_price, currentRevision.vehicles_price,
        currentRevision.addons_price, currentRevision.subtotal_price,
        currentRevision.discounts, currentRevision.total_discounts,
        currentRevision.additional_fees, currentRevision.total_fees,
        currentRevision.final_price, currentRevision.currency,
        currentRevision.vehicles_original,
        currentRevision.vehicles_adjusted || currentRevision.vehicles_original,
        currentRevision.addons_original,
        currentRevision.addons_adjusted || currentRevision.addons_original,
        currentRevision.tier_validated, currentRevision.vehicles_validated,
        currentRevision.addons_validated, currentRevision.participants_validated,
        currentRevision.dates_validated
      ]
    );

    // Mettre à jour l'ancienne révision avec la référence à la nouvelle
    await client.query(
      `UPDATE booking_quote_revisions SET superseded_by = $1 WHERE id = $2`,
      [newRevisionResult.rows[0].id, currentRevision.id]
    );

    await client.query('COMMIT');

    console.log(`✅ New revision (v${newRevisionNumber}) created for booking #${bookingId}`);

    res.status(201).json({
      success: true,
      message: `Revision ${newRevisionNumber} created successfully`,
      data: newRevisionResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating new revision:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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

  try {
    const revisionCheck = await db.query(
      'SELECT booking_id FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Revision not found' });
    }

    if (revisionCheck.rows[0].booking_id !== parseInt(bookingId)) {
      return res.status(400).json({
        success: false,
        error: 'Revision does not belong to this booking'
      });
    }

    // Calculer le prix total des véhicules
    let vehiclesTotal = 0;
    if (vehicles_adjusted && Array.isArray(vehicles_adjusted)) {
      vehiclesTotal = vehicles_adjusted.reduce((sum, v) => {
        const quantity = v.adjusted_quantity || v.quantity || 1;
        const price = v.adjusted_price || v.price || v.original_price || 0;
        return sum + (quantity * price);
      }, 0);
    }

    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET vehicles_adjusted = $1, vehicle_modifications_notes = $2,
           vehicles_price = $3, vehicles_validated = true
       WHERE id = $4 RETURNING *`,
      [JSON.stringify(vehicles_adjusted), vehicle_modifications_notes, vehiclesTotal, revisionId]
    );

    // Recalculer le prix total
    const revision = result.rows[0];
    const subtotal = (parseFloat(revision.base_price) || 0) +
                     vehiclesTotal + (parseFloat(revision.addons_price) || 0);
    const finalPrice = subtotal - (parseFloat(revision.total_discounts) || 0) +
                       (parseFloat(revision.total_fees) || 0);

    await db.query(
      `UPDATE booking_quote_revisions SET subtotal_price = $1, final_price = $2 WHERE id = $3`,
      [subtotal, finalPrice, revisionId]
    );

    console.log(`✅ Vehicles updated for revision #${revisionId}`);

    res.status(200).json({
      success: true,
      message: 'Vehicles updated successfully',
      data: { ...result.rows[0], subtotal_price: subtotal, final_price: finalPrice }
    });
  } catch (error) {
    console.error('Error updating vehicles:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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

  try {
    const revisionCheck = await db.query(
      'SELECT booking_id FROM booking_quote_revisions WHERE id = $1',
      [revisionId]
    );

    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Revision not found' });
    }

    if (revisionCheck.rows[0].booking_id !== parseInt(bookingId)) {
      return res.status(400).json({
        success: false,
        error: 'Revision does not belong to this booking'
      });
    }

    // Calculer le prix total des addons
    let addonsTotal = 0;
    if (addons_adjusted && Array.isArray(addons_adjusted)) {
      addonsTotal = addons_adjusted.reduce((sum, a) => {
        const quantity = a.adjusted_quantity || a.quantity || 1;
        const price = a.adjusted_price || a.price || a.original_price || 0;
        return sum + (quantity * price);
      }, 0);
    }

    const result = await db.query(
      `UPDATE booking_quote_revisions
       SET addons_adjusted = $1, addon_modifications_notes = $2,
           addons_price = $3, addons_validated = true
       WHERE id = $4 RETURNING *`,
      [JSON.stringify(addons_adjusted), addon_modifications_notes, addonsTotal, revisionId]
    );

    // Recalculer le prix total
    const revision = result.rows[0];
    const subtotal = (parseFloat(revision.base_price) || 0) +
                     (parseFloat(revision.vehicles_price) || 0) + addonsTotal;
    const finalPrice = subtotal - (parseFloat(revision.total_discounts) || 0) +
                       (parseFloat(revision.total_fees) || 0);

    await db.query(
      `UPDATE booking_quote_revisions SET subtotal_price = $1, final_price = $2 WHERE id = $3`,
      [subtotal, finalPrice, revisionId]
    );

    console.log(`✅ Add-ons updated for revision #${revisionId}`);

    res.status(200).json({
      success: true,
      message: 'Add-ons updated successfully',
      data: { ...result.rows[0], subtotal_price: subtotal, final_price: finalPrice }
    });
  } catch (error) {
    console.error('Error updating addons:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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
    await client.query('BEGIN');

    const revisionCheck = await client.query(
      'SELECT * FROM booking_quote_revisions WHERE id = $1 AND booking_id = $2',
      [revisionId, bookingId]
    );

    if (revisionCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Revision not found' });
    }

    console.log(`📧 Preparing quote for revision #${revisionId}...`);

    // Mettre à jour la révision (no more PDF paths)
    await client.query(
      `UPDATE booking_quote_revisions
       SET review_status = 'sent', is_current_version = true, quote_sent_at = NOW()
       WHERE id = $1`,
      [revisionId]
    );

    // Récupérer les infos du booking
    const bookingResult = await client.query(
      'SELECT user_id, contact_email, booking_reference FROM bookings WHERE id = $1',
      [bookingId]
    );

    const booking = bookingResult.rows[0];

    // Calculer la date d'expiration (48h)
    const expirationDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Mettre à jour le booking (no more PDF paths)
    await client.query(
      `UPDATE bookings
       SET status = 'Quote Sent', quote_sent_date = NOW(),
           quote_expiration_date = $1
       WHERE id = $2`,
      [expirationDate, bookingId]
    );

    await client.query('COMMIT');

    console.log(`📧 Sending quote email...`);

    // Envoyer l'email (simulé)
    try {
      const { sendQuoteEmail } = require('../services/emailSimulationService');
      await sendQuoteEmail(booking.user_id, bookingId, revisionId);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    console.log(`✅ Quote sent successfully for booking #${bookingId}`);

    res.status(200).json({
      success: true,
      message: 'Quote sent successfully to customer',
      data: { expirationDate }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error sending quote:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  } finally {
    client.release();
  }
};

module.exports = exports;
