const db = require("../db");
const specialOffersService = require("./specialOffersService");

/**
 * Quote Pricing Service
 * Handles price calculations including discounts, fees, and seasonal adjustments
 */

/**
 * Calculate base price for a package tier
 * @param {number} tierId - Package tier ID
 * @param {number} numAdults - Number of adults
 * @param {number} numChildren - Number of children
 * @returns {Object} Base price calculation
 */
async function calculateBasePrice(tierId, numAdults, numChildren) {
  try {
    const tierResult = await db.query(
      `SELECT price, tier_name FROM packagetiers WHERE id = $1`,
      [tierId]
    );

    if (tierResult.rows.length === 0) {
      return {
        success: false,
        error: "Package tier not found"
      };
    }

    const tier = tierResult.rows[0];
    const pricePerPerson = parseFloat(tier.price);

    // Le prix du tier est le prix PAR PERSONNE
    // Il faut multiplier par le nombre total de participants
    const totalParticipants = (numAdults || 0) + (numChildren || 0);
    const calculatedPrice = pricePerPerson * totalParticipants;

    return {
      success: true,
      base_price: calculatedPrice,
      price_per_person: pricePerPerson,
      tier_name: tier.tier_name,
      num_adults: numAdults,
      num_children: numChildren,
      total_participants: totalParticipants
    };
  } catch (error) {
    console.error("Error calculating base price:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate vehicles price
 * @param {Array} vehicles - Selected vehicles array
 * @param {number} durationDays - Tour duration in days
 * @returns {Object} Vehicles price calculation
 */
async function calculateVehiclesPrice(vehicles, durationDays) {
  try {
    if (!vehicles || vehicles.length === 0) {
      return {
        success: true,
        vehicles_price: 0,
        vehicles_breakdown: []
      };
    }

    let totalPrice = 0;
    const breakdown = [];

    for (const vehicle of vehicles) {
      const vehicleResult = await db.query(
        `SELECT * FROM vehicles WHERE id = $1`,
        [vehicle.id || vehicle.vehicle_id]
      );

      if (vehicleResult.rows.length === 0) {
        continue;
      }

      const vehicleData = vehicleResult.rows[0];
      const quantity = parseInt(vehicle.quantity || 1);
      // base_price_inr is the price per day for the vehicle
      const pricePerDay = parseFloat(vehicleData.base_price_inr || 0);
      const duration = parseInt(durationDays || 1);
      // IMPORTANT: Vehicle price = pricePerDay × duration × quantity
      const vehicleTotal = pricePerDay * duration * quantity;

      totalPrice += vehicleTotal;

      breakdown.push({
        id: vehicleData.id,
        name: vehicleData.name,
        quantity,
        price_per_day: pricePerDay,
        duration_days: duration,
        base_price: pricePerDay,
        total: vehicleTotal
      });
    }

    return {
      success: true,
      vehicles_price: totalPrice,
      vehicles_breakdown: breakdown
    };
  } catch (error) {
    console.error("Error calculating vehicles price:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate add-ons price
 * @param {Array} addons - Selected add-ons array
 * @param {Number} numAdults - Number of adults
 * @param {Number} numChildren - Number of children
 * @returns {Object} Add-ons price calculation
 */
async function calculateAddonsPrice(addons, numAdults = 0, numChildren = 0) {
  try {
    if (!addons || addons.length === 0) {
      return {
        success: true,
        addons_price: 0,
        addons_breakdown: []
      };
    }

    let totalPrice = 0;
    const breakdown = [];
    const totalParticipants = numAdults + numChildren;

    for (const addon of addons) {
      const addonResult = await db.query(
        `SELECT * FROM addons WHERE id = $1`,
        [addon.id || addon.addon_id]
      );

      if (addonResult.rows.length === 0) {
        continue;
      }

      const addonData = addonResult.rows[0];
      const quantity = parseInt(addon.quantity || 1);
      const price = parseFloat(addonData.price);
      const pricePerPerson = addonData.price_per_person !== false; // Default to true if not set

      // Calculate total based on pricing model
      let addonTotal;
      if (pricePerPerson && totalParticipants > 0) {
        // Per person pricing: price × quantity × participants
        addonTotal = price * quantity * totalParticipants;
      } else {
        // Fixed pricing: price × quantity only
        addonTotal = price * quantity;
      }

      totalPrice += addonTotal;

      breakdown.push({
        id: addonData.id,
        name: addonData.name,
        quantity,
        unit_price: price,
        price_per_person: pricePerPerson,
        participants: pricePerPerson ? totalParticipants : null,
        total: addonTotal
      });
    }

    return {
      success: true,
      addons_price: totalPrice,
      addons_breakdown: breakdown
    };
  } catch (error) {
    console.error("Error calculating add-ons price:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Apply automatic discounts based on booking details
 * @param {Object} bookingDetails - Booking details
 * @param {number} subtotal - Subtotal before discounts
 * @returns {Object} Auto-applied discounts
 */
async function applyAutomaticDiscounts(bookingDetails, subtotal) {
  const discounts = [];
  let totalDiscountAmount = 0;

  try {
    const { travel_date, inquiry_date, num_adults, num_children } = bookingDetails;
    const totalParticipants = (num_adults || 0) + (num_children || 0);

    // 1. Early Bird Discount (30+ days in advance)
    if (travel_date && inquiry_date) {
      const travelDate = new Date(travel_date);
      const inquiryDate = new Date(inquiry_date);
      const daysInAdvance = Math.floor((travelDate - inquiryDate) / (1000 * 60 * 60 * 24));

      if (daysInAdvance >= 30) {
        const discountPercentage = 10;
        const discountAmount = Math.round((subtotal * discountPercentage) / 100);

        discounts.push({
          id: `disc_early_bird_${Date.now()}`,
          type: "early_bird",
          name: "Early Bird Discount",
          amount: discountAmount,
          percentage: discountPercentage,
          reason: `Booking ${daysInAdvance} days in advance`,
          auto_applied: true,
          created_at: new Date().toISOString()
        });

        totalDiscountAmount += discountAmount;
      }
    }

    // 2. Group Discount (6+ participants)
    if (totalParticipants >= 6) {
      let discountPercentage = 0;
      if (totalParticipants >= 10) {
        discountPercentage = 15;
      } else if (totalParticipants >= 6) {
        discountPercentage = 10;
      }

      if (discountPercentage > 0) {
        const discountAmount = Math.round((subtotal * discountPercentage) / 100);

        discounts.push({
          id: `disc_group_${Date.now()}`,
          type: "group",
          name: "Group Discount",
          amount: discountAmount,
          percentage: discountPercentage,
          reason: `${totalParticipants} participants`,
          auto_applied: true,
          created_at: new Date().toISOString()
        });

        totalDiscountAmount += discountAmount;
      }
    }

    // 3. Off-Peak Season Discount (February, May, June, November)
    if (travel_date) {
      const month = new Date(travel_date).getMonth() + 1;
      if ([2, 5, 6, 11].includes(month)) {
        const discountPercentage = 10;
        const discountAmount = Math.round((subtotal * discountPercentage) / 100);

        discounts.push({
          id: `disc_offpeak_${Date.now()}`,
          type: "seasonal",
          name: "Off-Peak Season Discount",
          amount: discountAmount,
          percentage: discountPercentage,
          reason: "Travel during off-peak season",
          auto_applied: true,
          created_at: new Date().toISOString()
        });

        totalDiscountAmount += discountAmount;
      }
    }

    return {
      success: true,
      discounts,
      total_discount_amount: totalDiscountAmount
    };
  } catch (error) {
    console.error("Error applying automatic discounts:", error);
    return {
      success: false,
      discounts: [],
      total_discount_amount: 0,
      error: error.message
    };
  }
}

/**
 * Apply special offers from homepage if applicable
 * @param {Object} bookingDetails - Booking details
 * @param {number} subtotal - Subtotal before special offers
 * @returns {Object} Special offers and discounts
 */
async function applySpecialOffers(bookingDetails, subtotal) {
  try {
    const { user_id, travel_date, tour_id, num_adults, num_children, inquiry_date } = bookingDetails;
    const numberOfPersons = (num_adults || 0) + (num_children || 0);

    // Find applicable offers
    const applicableOffers = await specialOffersService.findApplicableOffers({
      userId: user_id,
      totalAmount: subtotal,
      travelDate: travel_date,
      tourId: tour_id,
      numberOfPersons,
      bookingDate: inquiry_date || new Date()
    });

    if (!applicableOffers || applicableOffers.length === 0) {
      return {
        success: true,
        discounts: [],
        total_discount_amount: 0,
        offers_applied: []
      };
    }

    // Use best single strategy (highest discount)
    const bestOffer = applicableOffers[0];

    const discountEntry = {
      id: `special_offer_${bestOffer.offerId}_${Date.now()}`,
      type: "special_offer",
      name: bestOffer.offerTitle,
      amount: bestOffer.discountAmount,
      percentage: bestOffer.discountPercentage,
      reason: bestOffer.applicableReason,
      auto_applied: true,
      offer_id: bestOffer.offerId,
      created_at: new Date().toISOString()
    };

    return {
      success: true,
      discounts: [discountEntry],
      total_discount_amount: bestOffer.discountAmount,
      offers_applied: [{
        offer_id: bestOffer.offerId,
        offer_title: bestOffer.offerTitle,
        offer_type: bestOffer.offerType,
        discount_amount: bestOffer.discountAmount,
        discount_percentage: bestOffer.discountPercentage,
        applied_at: new Date().toISOString()
      }]
    };
  } catch (error) {
    console.error("Error applying special offers:", error);
    return {
      success: false,
      discounts: [],
      total_discount_amount: 0,
      offers_applied: [],
      error: error.message
    };
  }
}

/**
 * Apply automatic fees based on booking details
 * @param {Object} bookingDetails - Booking details
 * @param {number} subtotal - Subtotal before fees
 * @returns {Object} Auto-applied fees
 */
async function applyAutomaticFees(bookingDetails, subtotal) {
  const fees = [];
  let totalFeeAmount = 0;

  try {
    const { travel_date, inquiry_date } = bookingDetails;

    // 1. Peak Season Surcharge (December, January, July, August)
    if (travel_date) {
      const month = new Date(travel_date).getMonth() + 1;
      if ([12, 1, 7, 8].includes(month)) {
        const feePercentage = 20;
        const feeAmount = Math.round((subtotal * feePercentage) / 100);

        fees.push({
          id: `fee_peak_${Date.now()}`,
          type: "peak_season",
          name: "Peak Season Surcharge",
          amount: feeAmount,
          percentage: feePercentage,
          reason: "Travel during peak season (high demand)",
          auto_applied: true,
          created_at: new Date().toISOString()
        });

        totalFeeAmount += feeAmount;
      }
    }

    // 2. Last Minute Booking Fee (less than 7 days in advance)
    if (travel_date && inquiry_date) {
      const travelDate = new Date(travel_date);
      const inquiryDate = new Date(inquiry_date);
      const daysInAdvance = Math.floor((travelDate - inquiryDate) / (1000 * 60 * 60 * 24));

      if (daysInAdvance < 7 && daysInAdvance >= 5) {
        const feePercentage = 15;
        const feeAmount = Math.round((subtotal * feePercentage) / 100);

        fees.push({
          id: `fee_lastminute_${Date.now()}`,
          type: "last_minute",
          name: "Last Minute Booking Fee",
          amount: feeAmount,
          percentage: feePercentage,
          reason: `Booking only ${daysInAdvance} days in advance`,
          auto_applied: true,
          created_at: new Date().toISOString()
        });

        totalFeeAmount += feeAmount;
      }
    }

    return {
      success: true,
      fees,
      total_fee_amount: totalFeeAmount
    };
  } catch (error) {
    console.error("Error applying automatic fees:", error);
    return {
      success: false,
      fees: [],
      total_fee_amount: 0,
      error: error.message
    };
  }
}

/**
 * Calculate complete quote pricing for a booking
 * @param {number} bookingId - Booking ID
 * @returns {Object} Complete price breakdown
 */
async function calculateQuotePrice(bookingId) {
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

    // Calculate base price
    const baseCalc = await calculateBasePrice(
      booking.tier_id,
      booking.num_adults,
      booking.num_children
    );

    if (!baseCalc.success) {
      return baseCalc;
    }

    // Calculate vehicles price
    const vehiclesCalc = await calculateVehiclesPrice(
      booking.selected_vehicles || [],
      durationDays
    );

    // Calculate add-ons price
    const addonsCalc = await calculateAddonsPrice(
      booking.selected_addons || [],
      booking.num_adults,
      booking.num_children
    );

    // Calculate subtotal
    const subtotal = baseCalc.base_price + vehiclesCalc.vehicles_price + addonsCalc.addons_price;

    // Apply automatic discounts
    const discountsResult = await applyAutomaticDiscounts(booking, subtotal);

    // Apply special offers from homepage if applicable
    const specialOffersResult = await applySpecialOffers(booking, subtotal);

    // Apply automatic fees
    const feesResult = await applyAutomaticFees(booking, subtotal);

    // Combine all discounts (automatic + special offers)
    const allDiscounts = [
      ...discountsResult.discounts,
      ...specialOffersResult.discounts
    ];
    const totalDiscounts = discountsResult.total_discount_amount + specialOffersResult.total_discount_amount;

    // Calculate final price
    const finalPrice = subtotal - totalDiscounts + feesResult.total_fee_amount;

    // Calculate price difference from estimated price
    const estimatedPrice = parseFloat(booking.estimated_price || 0);
    const priceDifference = finalPrice - estimatedPrice;
    const priceDifferencePercentage = estimatedPrice > 0
      ? Math.round((priceDifference / estimatedPrice) * 100 * 100) / 100
      : 0;

    return {
      success: true,
      pricing: {
        base_price: baseCalc.base_price,
        vehicles_price: vehiclesCalc.vehicles_price,
        addons_price: addonsCalc.addons_price,
        subtotal_price: subtotal,
        discounts: allDiscounts,
        total_discounts: totalDiscounts,
        special_offers_applied: specialOffersResult.offers_applied,
        additional_fees: feesResult.fees,
        total_fees: feesResult.total_fee_amount,
        final_price: finalPrice,
        original_estimated_price: estimatedPrice,
        price_difference: priceDifference,
        price_difference_percentage: priceDifferencePercentage,
        currency: booking.currency || "INR"
      },
      breakdown: {
        base: baseCalc,
        vehicles: vehiclesCalc.vehicles_breakdown,
        addons: addonsCalc.addons_breakdown
      }
    };
  } catch (error) {
    console.error("Error calculating quote price:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create a custom discount
 * @param {string} type - Discount type
 * @param {string} name - Discount name
 * @param {number} amount - Discount amount (if fixed) or null
 * @param {number} percentage - Discount percentage (if percentage-based) or null
 * @param {string} reason - Reason for discount
 * @returns {Object} Discount object
 */
function createCustomDiscount(type, name, amount, percentage, reason) {
  return {
    id: `disc_custom_${Date.now()}`,
    type,
    name,
    amount: amount || 0,
    percentage: percentage || null,
    reason,
    auto_applied: false,
    created_at: new Date().toISOString()
  };
}

/**
 * Create a custom fee
 * @param {string} type - Fee type
 * @param {string} name - Fee name
 * @param {number} amount - Fee amount (if fixed) or null
 * @param {number} percentage - Fee percentage (if percentage-based) or null
 * @param {string} reason - Reason for fee
 * @returns {Object} Fee object
 */
function createCustomFee(type, name, amount, percentage, reason) {
  return {
    id: `fee_custom_${Date.now()}`,
    type,
    name,
    amount: amount || 0,
    percentage: percentage || null,
    reason,
    auto_applied: false,
    created_at: new Date().toISOString()
  };
}

/**
 * Recalculate final price based on pricing components
 * @param {number} basePrice - Base price
 * @param {number} vehiclesPrice - Vehicles price
 * @param {number} addonsPrice - Add-ons price
 * @param {Array} discounts - Array of discounts
 * @param {Array} fees - Array of fees
 * @returns {Object} Final price calculation
 */
function recalculateFinalPrice(basePrice, vehiclesPrice, addonsPrice, discounts = [], fees = []) {
  const subtotal = (basePrice || 0) + (vehiclesPrice || 0) + (addonsPrice || 0);

  // Calculate total discounts
  const totalDiscounts = discounts.reduce((sum, discount) => {
    return sum + (parseFloat(discount.amount) || 0);
  }, 0);

  // Calculate total fees
  const totalFees = fees.reduce((sum, fee) => {
    return sum + (parseFloat(fee.amount) || 0);
  }, 0);

  const finalPrice = subtotal - totalDiscounts + totalFees;

  return {
    subtotal,
    total_discounts: totalDiscounts,
    total_fees: totalFees,
    final_price: Math.max(0, finalPrice) // Ensure price is never negative
  };
}

module.exports = {
  calculateBasePrice,
  calculateVehiclesPrice,
  calculateAddonsPrice,
  applyAutomaticDiscounts,
  applySpecialOffers,
  applyAutomaticFees,
  calculateQuotePrice,
  createCustomDiscount,
  createCustomFee,
  recalculateFinalPrice
};
