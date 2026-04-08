const db = require("../db");

/**
 * Quote Validation Service
 * Provides automatic validation and suggestions for booking quote revisions
 */

/**
 * Validate package tier availability and pricing
 * @param {number} tierId - Package tier ID
 * @param {Date} travelDate - Travel date
 * @param {number} numParticipants - Total number of participants
 * @returns {Object} Validation result with availability and pricing info
 */
async function validateTierAvailability(tierId, travelDate, numParticipants) {
  try {
    // Get tier details
    const tierResult = await db.query(
      `SELECT pt.*, t.max_group_size, t.min_age, t.name as tour_name
       FROM packagetiers pt
       JOIN tours t ON pt.tour_id = t.id
       WHERE pt.id = $1`,
      [tierId]
    );

    if (tierResult.rows.length === 0) {
      return {
        available: false,
        reason: "Package tier not found",
        tier: null
      };
    }

    const tier = tierResult.rows[0];

    // Check capacity
    if (tier.max_group_size && numParticipants > tier.max_group_size) {
      return {
        available: false,
        reason: `Maximum group size exceeded. Max: ${tier.max_group_size}, Requested: ${numParticipants}`,
        tier,
        capacity_exceeded: true,
        max_capacity: tier.max_group_size
      };
    }

    // Check tier availability (if tier has availability tracking)
    if (tier.is_available === false) {
      return {
        available: false,
        reason: "This package tier is currently unavailable",
        tier
      };
    }

    return {
      available: true,
      tier,
      base_price: parseFloat(tier.price),
      capacity_ok: true,
      suggestions: []
    };
  } catch (error) {
    console.error("Error validating tier:", error);
    return {
      available: false,
      reason: "Error validating tier availability",
      error: error.message
    };
  }
}

/**
 * Validate vehicles selection
 * @param {Array} vehicles - Selected vehicles array
 * @param {number} numParticipants - Total number of participants
 * @param {number} durationDays - Tour duration in days
 * @returns {Object} Validation result with capacity and availability info
 */
async function validateVehicles(vehicles, numParticipants, durationDays) {
  try {
    if (!vehicles || vehicles.length === 0) {
      return {
        validated: true,
        total_capacity: 0,
        capacity_sufficient: numParticipants === 0,
        availability_confirmed: true,
        vehicles_data: [],
        warnings: numParticipants > 0 ? ["No vehicles selected for participants"] : []
      };
    }

    let totalCapacity = 0;
    let totalPrice = 0;
    const vehiclesData = [];
    const warnings = [];
    const alternatives = [];

    // Validate each vehicle
    for (const vehicle of vehicles) {
      const vehicleResult = await db.query(
        `SELECT * FROM vehicles WHERE id = $1`,
        [vehicle.id || vehicle.vehicle_id]
      );

      if (vehicleResult.rows.length === 0) {
        warnings.push(`Vehicle ID ${vehicle.id || vehicle.vehicle_id} not found`);
        continue;
      }

      const vehicleData = vehicleResult.rows[0];
      const quantity = parseInt(vehicle.quantity || 1);

      totalCapacity += vehicleData.capacity * quantity;
      // base_price_inr is the total price for the vehicle, not per day
      totalPrice += parseFloat(vehicleData.base_price_inr) * quantity;

      vehiclesData.push({
        ...vehicleData,
        quantity,
        total_capacity: vehicleData.capacity * quantity,
        total_price: parseFloat(vehicleData.base_price_inr) * quantity,
        price_per_unit: parseFloat(vehicleData.base_price_inr)
      });

      // Check availability (if vehicle has availability tracking)
      if (vehicleData.is_available === false) {
        warnings.push(`${vehicleData.name} is currently unavailable`);

        // Suggest alternative
        const altResult = await db.query(
          `SELECT * FROM vehicles
           WHERE capacity >= $1 AND id != $2
           ORDER BY base_price_inr ASC
           LIMIT 3`,
          [vehicleData.capacity, vehicleData.id]
        );

        if (altResult.rows.length > 0) {
          alternatives.push({
            unavailable_vehicle: vehicleData.name,
            alternatives: altResult.rows
          });
        }
      }
    }

    return {
      validated: warnings.length === 0,
      total_capacity: totalCapacity,
      capacity_sufficient: totalCapacity >= numParticipants,
      availability_confirmed: warnings.length === 0,
      total_price: totalPrice,
      vehicles_data: vehiclesData,
      warnings,
      alternatives,
      capacity_gap: totalCapacity < numParticipants ? numParticipants - totalCapacity : 0
    };
  } catch (error) {
    console.error("Error validating vehicles:", error);
    return {
      validated: false,
      error: error.message
    };
  }
}

/**
 * Validate add-ons selection
 * @param {Array} addons - Selected add-ons array
 * @param {number} tourId - Tour ID
 * @returns {Object} Validation result with availability, conflicts, and suggestions
 */
async function validateAddons(addons, tourId) {
  try {
    if (!addons || addons.length === 0) {
      // Get suggestions for popular add-ons for this tour
      const suggestions = await getAddonSuggestions(tourId);

      return {
        validated: true,
        availability_confirmed: true,
        addons_data: [],
        total_price: 0,
        conflicts: [],
        suggestions
      };
    }

    let totalPrice = 0;
    const addonsData = [];
    const warnings = [];
    const conflicts = [];

    // Validate each add-on
    for (const addon of addons) {
      const addonResult = await db.query(
        `SELECT * FROM addons WHERE id = $1`,
        [addon.id || addon.addon_id]
      );

      if (addonResult.rows.length === 0) {
        warnings.push(`Add-on ID ${addon.id || addon.addon_id} not found`);
        continue;
      }

      const addonData = addonResult.rows[0];
      const quantity = parseInt(addon.quantity || 1);

      totalPrice += parseFloat(addonData.price) * quantity;

      addonsData.push({
        ...addonData,
        quantity,
        total_price: parseFloat(addonData.price) * quantity
      });

      // Check availability
      if (addonData.is_active === false) {
        warnings.push(`${addonData.name} is currently unavailable`);
      }
    }

    // Check for conflicts (example: mutually exclusive add-ons)
    // This is a placeholder - you can implement specific business logic
    const conflictCheck = await checkAddonConflicts(addons);
    if (conflictCheck.conflicts.length > 0) {
      conflicts.push(...conflictCheck.conflicts);
    }

    // Get suggestions
    const suggestions = await getAddonSuggestions(tourId, addons);

    return {
      validated: warnings.length === 0,
      availability_confirmed: warnings.length === 0,
      addons_data: addonsData,
      total_price: totalPrice,
      warnings,
      conflicts,
      suggestions
    };
  } catch (error) {
    console.error("Error validating add-ons:", error);
    return {
      validated: false,
      error: error.message
    };
  }
}

/**
 * Check for conflicts between selected add-ons
 * @param {Array} addons - Selected add-ons
 * @returns {Object} Conflicts found
 */
async function checkAddonConflicts(addons) {
  try {
    // Placeholder for conflict checking logic
    // You can implement specific business rules here
    // For example: certain add-ons cannot be combined

    const conflicts = [];

    // Example: Check if user selected both "Budget Meal Plan" and "Premium Meal Plan"
    const addonNames = addons.map(a => a.name).filter(Boolean);

    if (addonNames.includes("Budget Meal Plan") && addonNames.includes("Premium Meal Plan")) {
      conflicts.push({
        addon_1: "Budget Meal Plan",
        addon_2: "Premium Meal Plan",
        reason: "Cannot select both budget and premium meal plans. Please choose one."
      });
    }

    return { conflicts };
  } catch (error) {
    console.error("Error checking add-on conflicts:", error);
    return { conflicts: [] };
  }
}

/**
 * Get add-on suggestions for a tour
 * @param {number} tourId - Tour ID
 * @param {Array} currentAddons - Currently selected add-ons (optional)
 * @returns {Array} Suggested add-ons
 */
async function getAddonSuggestions(tourId, currentAddons = []) {
  try {
    const currentAddonIds = currentAddons.map(a => a.id || a.addon_id).filter(Boolean);

    // Get popular add-ons for this tour (excluding already selected ones)
    const query = `
      SELECT a.*, COUNT(ba.value->>'addon_id') as booking_count
      FROM addons a
      LEFT JOIN bookings b ON true
      LEFT JOIN LATERAL jsonb_array_elements(b.selected_addons) AS ba ON (ba.value->>'addon_id')::int = a.id
      WHERE a.is_active = true
        ${currentAddonIds.length > 0 ? `AND a.id NOT IN (${currentAddonIds.join(',')})` : ''}
      GROUP BY a.id
      ORDER BY booking_count DESC, a.price ASC
      LIMIT 5
    `;

    const result = await db.query(query);

    return result.rows.map(addon => ({
      addon_id: addon.id,
      name: addon.name,
      price: parseFloat(addon.price),
      category: addon.category,
      reason: `Popular add-on with this tour (${addon.booking_count} bookings)`,
      popularity: parseInt(addon.booking_count || 0)
    }));
  } catch (error) {
    console.error("Error getting add-on suggestions:", error);
    return [];
  }
}

/**
 * Validate participant ages against tour requirements
 * @param {Array} participantAges - Array of participant age objects
 * @param {number} tourId - Tour ID
 * @returns {Object} Validation result with age violations
 */
async function validateParticipantAges(participantAges, tourId) {
  try {
    // Get tour age requirements
    const tourResult = await db.query(
      `SELECT min_age, max_group_size FROM tours WHERE id = $1`,
      [tourId]
    );

    if (tourResult.rows.length === 0) {
      return {
        validated: false,
        reason: "Tour not found"
      };
    }

    const tour = tourResult.rows[0];
    const violations = [];
    let requirementsMet = true;

    if (!participantAges || participantAges.length === 0) {
      return {
        validated: true,
        age_requirements_met: true,
        violations: []
      };
    }

    // Check each participant
    participantAges.forEach((participant, index) => {
      const age = participant.age || participant.value;

      if (tour.min_age && age < tour.min_age) {
        violations.push({
          participant: index + 1,
          age,
          min_required: tour.min_age,
          reason: `Participant ${index + 1} (age ${age}) is below minimum age requirement (${tour.min_age})`
        });
        requirementsMet = false;
      }

      // Note: max_age is not defined in tours table, only min_age is enforced
    });

    // Check group size
    const capacityExceeded = tour.max_group_size && participantAges.length > tour.max_group_size;

    return {
      validated: requirementsMet && !capacityExceeded,
      age_requirements_met: requirementsMet,
      capacity_requirements_met: !capacityExceeded,
      max_capacity_exceeded: capacityExceeded,
      violations,
      max_group_size: tour.max_group_size,
      total_participants: participantAges.length
    };
  } catch (error) {
    console.error("Error validating participant ages:", error);
    return {
      validated: false,
      error: error.message
    };
  }
}

/**
 * Validate travel date and check for seasonal pricing
 * @param {Date} travelDate - Travel date
 * @param {number} tourId - Tour ID
 * @returns {Object} Validation result with seasonal pricing info
 */
async function validateTravelDate(travelDate, tourId) {
  try {
    const date = new Date(travelDate);
    const now = new Date();

    // Check if date is in the past
    if (date < now) {
      return {
        validated: false,
        reason: "Travel date cannot be in the past"
      };
    }

    // Check advance booking period (minimum 5 days)
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    if (date < fiveDaysFromNow) {
      return {
        validated: false,
        reason: "Bookings must be made at least 5 days in advance"
      };
    }

    // Determine season and pricing
    const month = date.getMonth() + 1; // 1-12
    let season = "regular";
    let multiplier = 1.0;

    // Peak season: December, January, July, August
    if ([12, 1, 7, 8].includes(month)) {
      season = "peak";
      multiplier = 1.2; // 20% increase
    }
    // Shoulder season: March, April, September, October
    else if ([3, 4, 9, 10].includes(month)) {
      season = "shoulder";
      multiplier = 1.1; // 10% increase
    }
    // Off-peak: February, May, June, November
    else if ([2, 5, 6, 11].includes(month)) {
      season = "off_peak";
      multiplier = 0.9; // 10% discount
    }

    return {
      validated: true,
      seasonal_pricing_applied: season !== "regular",
      seasonal_pricing_details: {
        season,
        multiplier,
        period: getSeasonPeriod(season),
        description: getSeasonDescription(season)
      }
    };
  } catch (error) {
    console.error("Error validating travel date:", error);
    return {
      validated: false,
      error: error.message
    };
  }
}

/**
 * Get season period description
 * @param {string} season - Season name
 * @returns {string} Period description
 */
function getSeasonPeriod(season) {
  const periods = {
    peak: "Dec-Jan, Jul-Aug",
    shoulder: "Mar-Apr, Sep-Oct",
    off_peak: "Feb, May-Jun, Nov",
    regular: "Year-round"
  };
  return periods[season] || "Year-round";
}

/**
 * Get season description
 * @param {string} season - Season name
 * @returns {string} Season description
 */
function getSeasonDescription(season) {
  const descriptions = {
    peak: "High demand period with premium pricing",
    shoulder: "Moderate demand period with slight premium",
    off_peak: "Low demand period with discounted pricing",
    regular: "Standard pricing"
  };
  return descriptions[season] || "Standard pricing";
}

/**
 * Run full automatic validation on a booking
 * @param {number} bookingId - Booking ID
 * @returns {Object} Complete validation results
 */
async function runFullValidation(bookingId) {
  try {
    // Get booking details
    const bookingResult = await db.query(
      `SELECT b.*, t.duration_days, t.itinerary
       FROM bookings b
       JOIN tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return {
        success: false,
        error: "Booking not found"
      };
    }

    const booking = bookingResult.rows[0];
    const durationDays = booking.itinerary ? booking.itinerary.length : booking.duration_days;
    const numParticipants = (booking.num_adults || 0) + (booking.num_children || 0);

    // Run all validations
    const tierValidation = await validateTierAvailability(
      booking.tier_id,
      booking.travel_date,
      numParticipants
    );

    const vehiclesValidation = await validateVehicles(
      booking.selected_vehicles || [],
      numParticipants,
      durationDays
    );

    const addonsValidation = await validateAddons(
      booking.selected_addons || [],
      booking.tour_id
    );

    const participantsValidation = await validateParticipantAges(
      booking.participant_ages || [],
      booking.tour_id
    );

    const dateValidation = await validateTravelDate(
      booking.travel_date,
      booking.tour_id
    );

    // Calculate validation score
    let score = 0;
    if (tierValidation.available) score += 20;
    if (vehiclesValidation.validated) score += 20;
    if (addonsValidation.validated) score += 20;
    if (participantsValidation.validated) score += 20;
    if (dateValidation.validated) score += 20;

    return {
      success: true,
      validation_score: score,
      tier_validation: tierValidation,
      vehicles_validation: vehiclesValidation,
      addons_validation: addonsValidation,
      participants_validation: participantsValidation,
      date_validation: dateValidation,
      validated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error running full validation:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  validateTierAvailability,
  validateVehicles,
  validateAddons,
  validateParticipantAges,
  validateTravelDate,
  runFullValidation,
  getAddonSuggestions,
  checkAddonConflicts
};
