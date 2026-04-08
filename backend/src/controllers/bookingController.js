const db = require("../db");
const { convertCurrency } = require("../utils/currencyConverter");
const {
  sendInquiryConfirmationEmailToUser,
  sendNewInquiryEmailToAdmin,
  sendQuoteEmailToUser,
  sendCancellationEmailToUser,
} = require("../services/emailService");
const { logUserActivity } = require("../services/activityService");
const notificationService = require("../services/notificationService");

// --- Create a new booking inquiry ---
exports.createBookingInquiry = async (req, res) => {
  const userId = req.user.id;
  const {
    tour_id,
    package_tier_id,
    travel_date,
    number_of_persons,
    additional_vehicles,
    selected_addons,
    selected_currency,
  } = req.body;

  if (!tour_id || !package_tier_id || !travel_date || !number_of_persons) {
    return res
      .status(400)
      .json({ error: "Missing required booking information." });
  }

  // Enhanced date validation
  const travelDate = new Date(travel_date);
  const now = new Date();
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  // Validate travel date format
  if (isNaN(travelDate.getTime())) {
    return res
      .status(400)
      .json({ error: "Invalid travel date format. Please use YYYY-MM-DD." });
  }

  // Check minimum advance booking period
  if (travelDate < fiveDaysFromNow) {
    return res
      .status(400)
      .json({ 
        error: "Bookings must be made at least 5 days in advance.",
        earliestDate: fiveDaysFromNow.toISOString().split('T')[0]
      });
  }

  // Check maximum advance booking period
  if (travelDate > oneYearFromNow) {
    return res
      .status(400)
      .json({ 
        error: "Bookings cannot be made more than 1 year in advance.",
        latestDate: oneYearFromNow.toISOString().split('T')[0]
      });
  }

  // Validate number of persons
  if (number_of_persons < 1 || number_of_persons > 50) {
    return res
      .status(400)
      .json({ error: "Number of persons must be between 1 and 50." });
  }

  try {
    // --- Security: Recalculate the total price in INR (base currency) ---
    let calculatedPriceInr = 0;

    const tierResult = await db.query(
      "SELECT price, tier_name FROM PackageTiers WHERE id = $1",
      [package_tier_id]
    );
    if (tierResult.rows.length === 0)
      return res.status(404).json({ error: "Selected package not found." });
    calculatedPriceInr += parseFloat(tierResult.rows[0].price);
    const tier_name = tierResult.rows[0].tier_name;

    const tourResult = await db.query(
      "SELECT name, itinerary FROM Tours WHERE id = $1",
      [tour_id]
    );
    const durationInDays = tourResult.rows[0].itinerary.length;
    const tour_name = tourResult.rows[0].name;

    if (additional_vehicles) {
      for (const vehicle of additional_vehicles) {
        const vehicleResult = await db.query(
          "SELECT price_per_day FROM Vehicles WHERE id = $1",
          [vehicle.vehicle_id]
        );
        if (vehicleResult.rows.length > 0) {
          calculatedPriceInr +=
            parseInt(vehicle.quantity, 10) *
            parseFloat(vehicleResult.rows[0].price_per_day) *
            durationInDays;
        }
      }
    }

    if (selected_addons) {
      for (const addon of selected_addons) {
        const addonResult = await db.query(
          "SELECT price FROM AddOns WHERE id = $1",
          [addon.addon_id]
        );
        if (addonResult.rows.length > 0) {
          calculatedPriceInr +=
            parseInt(addon.quantity, 10) *
            parseFloat(addonResult.rows[0].price);
        }
      }
    }

    // --- Convert to the customer's selected currency ---
    const finalPrice = convertCurrency(
      calculatedPriceInr,
      selected_currency || "INR"
    );

    // --- Save the booking to the database ---
    const newBooking = await db.query(
      `INSERT INTO Bookings (user_id, tour_id, package_tier_id, travel_date, number_of_persons, additional_vehicles, selected_addons, total_price, selected_currency, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Inquiry Pending')
       RETURNING id;`,
      [
        userId,
        tour_id,
        package_tier_id,
        travel_date,
        number_of_persons,
        JSON.stringify(additional_vehicles),
        JSON.stringify(selected_addons),
        finalPrice.amount,
        finalPrice.currency,
      ]
    );
    const bookingId = newBooking.rows[0].id;

    // --- Trigger notifications ---
    const userDetails = req.user;
    const bookingDetails = {
      bookingId,
      tour_name, // Correctly fetched from the database
      travel_date,
      number_of_persons,
      tier_name, // Correctly fetched from the database
      total_price: finalPrice.amount,
      selected_currency: finalPrice.currency,
    };

    // Pass user details to admin notification as well for context
    await logUserActivity(userId, "Booking Request", { tourId: tour_id, bookingId });
    await sendInquiryConfirmationEmailToUser(userId, bookingId);
    await sendNewInquiryEmailToAdmin(); // Arguments will be modified with time

    res.status(201).json({
      message: "Booking inquiry submitted successfully!",
      bookingId: bookingId,
    });
  } catch (error) {
    console.error("Error creating booking inquiry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- NEW FUNCTION (Client): Cancel an inquiry before payment ---
exports.cancelBookingByUser = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id; // The ID of the logged-in user

  try {
    const bookingResult = await db.query(
      "SELECT * FROM Bookings WHERE id = $1",
      [bookingId]
    );
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found." });
    }

    const booking = bookingResult.rows[0];

    // Security: Verify that the booking belongs to the user making the request.
    if (booking.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to cancel this booking." });
    }

    // Business Rule: The user can only cancel if the status is 'Inquiry Pending' or 'Quote Sent'.
    if (
      booking.status !== "Inquiry Pending" &&
      booking.status !== "Quote Sent"
    ) {
      return res.status(400).json({
        error: `Cannot cancel a booking with status '${booking.status}'.`,
      });
    }

    // Update the status
    const updatedBooking = await db.query(
      "UPDATE Bookings SET status = 'Cancelled' WHERE id = $1 RETURNING *",
      [bookingId]
    );

    // Send cancellation notifications
    await logUserActivity(userId, "Booking Cancelled", { bookingId });
    await sendCancellationEmailToUser(req.user.id);

    res.status(200).json({
      message: "Booking inquiry successfully cancelled.",
      booking: updatedBooking.rows[0],
    });
  } catch (error) {
    console.error(`Error cancelling booking #${bookingId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- NEW FUNCTION (Admin): Update a booking's status ---
exports.updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { newStatus, finalPrice } = req.body; // The admin can adjust the final price

  // We could add validation to ensure newStatus is a valid value
  if (!newStatus) {
    return res.status(400).json({ error: "New status is required." });
  }

  try {
    const bookingResult = await db.query(
      "SELECT * FROM Bookings WHERE id = $1",
      [bookingId]
    );
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found." });
    }

    let updatedPrice = finalPrice || bookingResult.rows[0].total_price;

    let queryText =
      "UPDATE Bookings SET status = $1, total_price = $2 WHERE id = $3 RETURNING *";
    let queryParams = [newStatus, updatedPrice, bookingId];

    const updatedBooking = await db.query(queryText, queryParams);

    // If the status is "Quote Sent", send the quote email
    if (newStatus === "Quote Sent") {
      const userResult = await db.query("SELECT * FROM Users WHERE id = $1", [
        updatedBooking.rows[0].user_id,
      ]);
      const tourResult = await db.query(
        "SELECT name FROM Tours WHERE id = $1",
        [updatedBooking.rows[0].tour_id]
      );

      const userDetails = userResult.rows[0];
      const bookingDetails = {
        ...updatedBooking.rows[0],
        tour_name: tourResult.rows[0].name,
      };

      await sendQuoteEmailToUser(userDetails.id, bookingDetails.id);
    }

    if (newStatus === "Payment Confirmed") {
      await logUserActivity(updatedBooking.rows[0].user_id, "Payment Made", { bookingId });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully!",
      booking: updatedBooking.rows[0],
    });
  } catch (error) {
    console.error(`Error updating booking #${bookingId} status:`, error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// --- Get a user's bookings using enriched view ---
exports.getUserBookings = async (req, res) => {
  const userId = req.user.id;
  const { status, limit = 20, offset = 0 } = req.query;

  try {
    let query = `
      SELECT
        bhe.*,
        EXISTS(
          SELECT 1 FROM reviews r
          WHERE r.user_id = bhe.user_id
          AND r.tour_id = bhe.tour_id
        ) as has_reviewed
      FROM booking_history_enriched bhe
      WHERE bhe.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND bhe.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY bhe.inquiry_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const bookings = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM booking_history_enriched WHERE user_id = $1';
    const countParams = [userId];
    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    res.status(200).json({
      bookings: bookings.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalCount,
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Get booking statistics for a user or admin.
 * Returns comprehensive booking analytics using enriched views.
 * @route GET /api/bookings/stats
 * @access Private
 */
exports.getBookingStats = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const { period = '30d', userId: targetUserId } = req.query;
  
  try {
    let dateFilter = '';
    let params = [];
    let paramIndex = 1;
    
    // Date period filter
    switch (period) {
      case '7d':
        dateFilter = `AND inquiry_date >= NOW() - INTERVAL '7 days'`;
        break;
      case '30d':
        dateFilter = `AND inquiry_date >= NOW() - INTERVAL '30 days'`;
        break;
      case '90d':
        dateFilter = `AND inquiry_date >= NOW() - INTERVAL '90 days'`;
        break;
      case '1y':
        dateFilter = `AND inquiry_date >= NOW() - INTERVAL '1 year'`;
        break;
      default:
        dateFilter = `AND inquiry_date >= NOW() - INTERVAL '30 days'`;
    }
    
    // User filter - admin can view any user's stats, regular users only their own
    let userFilter = '';
    if (isAdmin && targetUserId) {
      userFilter = `user_id = $${paramIndex}`;
      params.push(targetUserId);
      paramIndex++;
    } else {
      userFilter = `user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    // Get comprehensive booking statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'Payment Confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'Inquiry Pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'Quote Sent' THEN 1 END) as quoted_bookings,
        COALESCE(SUM(CASE WHEN status = 'Payment Confirmed' THEN total_price ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status = 'Payment Confirmed' THEN total_price END), 0) as avg_booking_value,
        COUNT(DISTINCT tour_id) as unique_tours_booked,
        COUNT(DISTINCT EXTRACT(MONTH FROM travel_date)) as months_with_travel
      FROM booking_history_enriched 
      WHERE ${userFilter} ${dateFilter}
    `;
    
    const statsResult = await db.query(statsQuery, params);
    
    // Get booking trends by month
    const trendsQuery = `
      SELECT 
        DATE_TRUNC('month', inquiry_date) as month,
        COUNT(*) as bookings_count,
        COALESCE(SUM(CASE WHEN status = 'Payment Confirmed' THEN total_price ELSE 0 END), 0) as revenue
      FROM booking_history_enriched 
      WHERE ${userFilter} ${dateFilter}
      GROUP BY DATE_TRUNC('month', inquiry_date)
      ORDER BY month DESC
      LIMIT 12
    `;
    
    const trendsResult = await db.query(trendsQuery, params);
    
    // Get top destinations
    const destinationsQuery = `
      SELECT 
        unnest(destinations) as destination,
        COUNT(*) as booking_count
      FROM booking_history_enriched 
      WHERE ${userFilter} ${dateFilter}
      GROUP BY destination
      ORDER BY booking_count DESC
      LIMIT 10
    `;
    
    const destinationsResult = await db.query(destinationsQuery, params);
    
    res.status(200).json({
      period,
      stats: statsResult.rows[0],
      trends: trendsResult.rows,
      topDestinations: destinationsResult.rows
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @description Get all bookings with enhanced filtering (Admin only).
 * Uses booking_history_enriched view for comprehensive data.
 * @route GET /api/bookings/admin/all
 * @access Private (Admin only)
 */
exports.getAllBookingsEnriched = async (req, res) => {
  const {
    status,
    tour_id,     // Accept tour_id from frontend
    tourId,      // Keep for backwards compatibility
    userId,
    startDate,   // Accept startDate from frontend
    endDate,     // Accept endDate from frontend
    dateFrom,    // Keep for backwards compatibility
    dateTo,      // Keep for backwards compatibility
    minAmount,
    maxAmount,
    search,      // NEW: Accept search parameter
    sortKey,     // Accept sortKey from frontend
    sortDirection, // Accept sortDirection from frontend
    sortBy = 'inquiry_date',
    sortOrder = 'DESC',
    limit = 50,
    page = 1     // Accept page parameter from frontend
  } = req.query;

  // Calculate offset from page number
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Use frontend parameters or fallback to old parameter names
  const finalTourId = tour_id || tourId;
  const finalDateFrom = startDate || dateFrom;
  const finalDateTo = endDate || dateTo;
  const finalSortBy = sortKey || sortBy;
  const finalSortOrder = sortDirection || sortOrder;

  try {
    // DEBUG: Log all received parameters
    console.log('========== getAllBookingsEnriched DEBUG ==========');
    console.log('Received parameters:', {
      page, limit, offset,
      status, tour_id, tourId, userId,
      startDate, endDate, dateFrom, dateTo,
      search, sortKey, sortDirection, sortBy, sortOrder
    });
    console.log('Final parameters:', {
      finalTourId, finalDateFrom, finalDateTo, finalSortBy, finalSortOrder
    });

    let query = 'SELECT * FROM booking_history_enriched WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply search filter (search across multiple fields)
    if (search && search.trim() !== '') {
      query += ` AND (
        CAST(id AS TEXT) LIKE $${paramIndex} OR
        LOWER(user_name) LIKE $${paramIndex} OR
        LOWER(user_email) LIKE $${paramIndex} OR
        LOWER(tour_name) LIKE $${paramIndex} OR
        LOWER(status) LIKE $${paramIndex}
      )`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    // Apply filters
    if (status && status !== '') {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (finalTourId && finalTourId !== '') {
      query += ` AND tour_id = $${paramIndex}`;
      params.push(finalTourId);
      paramIndex++;
    }
    
    if (userId && userId !== '') {
      query += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (finalDateFrom && finalDateFrom !== '') {
      query += ` AND inquiry_date >= $${paramIndex}`;
      params.push(finalDateFrom);
      paramIndex++;
    }

    if (finalDateTo && finalDateTo !== '') {
      query += ` AND inquiry_date <= $${paramIndex}`;
      params.push(finalDateTo);
      paramIndex++;
    }
    
    if (minAmount) {
      query += ` AND total_price >= $${paramIndex}`;
      params.push(minAmount);
      paramIndex++;
    }
    
    if (maxAmount) {
      query += ` AND total_price <= $${paramIndex}`;
      params.push(maxAmount);
      paramIndex++;
    }
    
    // Sorting - map frontend sortKey to database columns
    const sortFieldMapping = {
      'id': 'id',
      'travel_date': 'travel_date',
      'status': 'status',
      'inquiry_date': 'inquiry_date',
      'tour_name': 'tour_name',
      'total_price': 'total_price'
    };

    const allowedSortFields = ['id', 'inquiry_date', 'travel_date', 'total_price', 'status', 'tour_name'];
    const mappedSortField = sortFieldMapping[finalSortBy] || finalSortBy;
    const sortField = allowedSortFields.includes(mappedSortField) ? mappedSortField : 'inquiry_date';
    const order = finalSortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortField} ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // DEBUG: Log the final query and params
    console.log('Final SQL Query:', query);
    console.log('Query params:', params);

    const bookings = await db.query(query, params);

    // DEBUG: Log results
    console.log(`Found ${bookings.rows.length} bookings`);
    console.log('==================================================')
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM booking_history_enriched WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    // Apply same filters for count (must match main query exactly)
    if (search && search.trim() !== '') {
      countQuery += ` AND (
        CAST(id AS TEXT) LIKE $${countParamIndex} OR
        LOWER(user_name) LIKE $${countParamIndex} OR
        LOWER(user_email) LIKE $${countParamIndex} OR
        LOWER(tour_name) LIKE $${countParamIndex} OR
        LOWER(status) LIKE $${countParamIndex}
      )`;
      countParams.push(`%${search.toLowerCase()}%`);
      countParamIndex++;
    }

    if (status && status !== '') {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (finalTourId && finalTourId !== '') {
      countQuery += ` AND tour_id = $${countParamIndex}`;
      countParams.push(finalTourId);
      countParamIndex++;
    }

    if (userId && userId !== '') {
      countQuery += ` AND user_id = $${countParamIndex}`;
      countParams.push(userId);
      countParamIndex++;
    }

    if (finalDateFrom && finalDateFrom !== '') {
      countQuery += ` AND inquiry_date >= $${countParamIndex}`;
      countParams.push(finalDateFrom);
      countParamIndex++;
    }

    if (finalDateTo && finalDateTo !== '') {
      countQuery += ` AND inquiry_date <= $${countParamIndex}`;
      countParams.push(finalDateTo);
      countParamIndex++;
    }

    if (minAmount) {
      countQuery += ` AND total_price >= $${countParamIndex}`;
      countParams.push(minAmount);
      countParamIndex++;
    }

    if (maxAmount) {
      countQuery += ` AND total_price <= $${countParamIndex}`;
      countParams.push(maxAmount);
      countParamIndex++;
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const currentPage = Math.floor(parseInt(offset) / parseInt(limit)) + 1;

    res.status(200).json({
      success: true,
      data: {
        bookings: bookings.rows,
        totalPages: totalPages,
        currentPage: currentPage,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: totalCount,
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        }
      }
    });
  } catch (error) {
    console.error("Error fetching enriched bookings:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// --- NEW FUNCTION (Admin): Send quote to customer ---
exports.sendQuoteToCustomer = async (req, res) => {
  const { bookingId } = req.params;
  const { final_price, quote_details } = req.body;

  if (!final_price || final_price <= 0) {
    return res.status(400).json({
      success: false,
      error: "Valid final price is required."
    });
  }

  try {
    // Verify booking exists
    const bookingResult = await db.query(
      "SELECT * FROM Bookings WHERE id = $1",
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Booking not found."
      });
    }

    const booking = bookingResult.rows[0];

    // Business rule: Can only send quote if status is "Inquiry Pending"
    if (booking.status !== "Inquiry Pending") {
      return res.status(400).json({
        success: false,
        error: `Cannot send quote for booking with status '${booking.status}'.`,
      });
    }

    // Update booking: set status, final price, quote_sent_date
    const updatedBooking = await db.query(
      `UPDATE Bookings
       SET status = 'Quote Sent',
           final_price = $1,
           quote_sent_date = NOW(),
           quote_details = $2
       WHERE id = $3
       RETURNING *`,
      [final_price, quote_details || null, bookingId]
    );

    // Send quote email to user
    const userResult = await db.query("SELECT * FROM Users WHERE id = $1", [
      booking.user_id,
    ]);
    const tourResult = await db.query(
      "SELECT name FROM Tours WHERE id = $1",
      [booking.tour_id]
    );

    const userDetails = userResult.rows[0];
    const bookingDetails = {
      ...updatedBooking.rows[0],
      tour_name: tourResult.rows[0].name,
    };

    await sendQuoteEmailToUser(userDetails.id, bookingDetails.id);
    await logUserActivity(booking.user_id, "Quote Received", { bookingId });

    res.status(200).json({
      success: true,
      message: "Quote sent successfully to customer!",
      booking: updatedBooking.rows[0],
    });
  } catch (error) {
    console.error(`Error sending quote for booking #${bookingId}:`, error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// --- NEW FUNCTION (Admin): Mark trip as completed ---
exports.markTripCompleted = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Verify booking exists
    const bookingResult = await db.query(
      "SELECT * FROM Bookings WHERE id = $1",
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Booking not found."
      });
    }

    const booking = bookingResult.rows[0];

    // Business rule: Can only complete if status is "Payment Confirmed"
    if (booking.status !== "Payment Confirmed") {
      return res.status(400).json({
        success: false,
        error: `Cannot complete booking with status '${booking.status}'. Payment must be confirmed first.`,
      });
    }

    // Update booking: set status and completion_date
    const updatedBooking = await db.query(
      `UPDATE Bookings
       SET status = 'Trip Completed',
           completion_date = NOW()
       WHERE id = $1
       RETURNING *`,
      [bookingId]
    );

    // Get full booking details with tour name for notification
    const fullBookingQuery = await db.query(
      `SELECT b.*, t.name as tour_name
       FROM Bookings b
       JOIN Tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    // Create trip completed notification
    if (fullBookingQuery.rows.length > 0) {
      await notificationService.createTripCompletedNotification(
        fullBookingQuery.rows[0]
      );
    }

    // Log activity
    await logUserActivity(booking.user_id, "Trip Completed", { bookingId });

    res.status(200).json({
      success: true,
      message: "Trip marked as completed successfully!",
      booking: updatedBooking.rows[0],
    });
  } catch (error) {
    console.error(`Error completing booking #${bookingId}:`, error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// --- NEW FUNCTION (Admin): Get admin booking statistics ---
exports.getAdminBookingStats = async (req, res) => {
  try {
    // Get comprehensive stats for admin dashboard
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Inquiry Pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'Quote Sent' THEN 1 END) as quoted,
        COUNT(CASE WHEN status = 'Payment Confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'Trip Completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled,
        COALESCE(SUM(CASE
          WHEN status IN ('Payment Confirmed', 'Trip Completed')
          THEN COALESCE(final_price, estimated_price)
          ELSE 0
        END), 0) as revenue
      FROM booking_history_enriched
    `;

    const result = await db.query(statsQuery);
    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        total: parseInt(stats.total) || 0,
        pending: parseInt(stats.pending) || 0,
        quoted: parseInt(stats.quoted) || 0,
        confirmed: parseInt(stats.confirmed) || 0,
        completed: parseInt(stats.completed) || 0,
        cancelled: parseInt(stats.cancelled) || 0,
        revenue: parseFloat(stats.revenue) || 0,
      }
    });
  } catch (error) {
    console.error("Error fetching admin booking stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// --- NEW FUNCTION (Admin): Get single booking by ID ---
exports.getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM booking_history_enriched WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Booking not found."
      });
    }

    const booking = result.rows[0];

    console.log('[DEBUG] Raw booking data for ID', id);
    console.log('[DEBUG] selected_vehicles:', booking.selected_vehicles);
    console.log('[DEBUG] selected_addons:', booking.selected_addons);

    // Enrich selected_vehicles with full details from vehicles table
    if (booking.selected_vehicles && Array.isArray(booking.selected_vehicles)) {
      console.log('[DEBUG] Enriching', booking.selected_vehicles.length, 'vehicles...');
      const enrichedVehicles = await Promise.all(
        booking.selected_vehicles.map(async (selectedVehicle) => {
          if (selectedVehicle.vehicle_id) {
            try {
              const vehicleResult = await db.query(
                'SELECT id, name, capacity, base_price_inr FROM vehicles WHERE id = $1',
                [selectedVehicle.vehicle_id]
              );

              if (vehicleResult.rows.length > 0) {
                const vehicleData = vehicleResult.rows[0];
                const enrichedData = {
                  vehicle_id: selectedVehicle.vehicle_id,
                  name: vehicleData.name,
                  vehicle_name: vehicleData.name,
                  quantity: selectedVehicle.quantity || 1,
                  capacity: vehicleData.capacity,
                  price: parseFloat(vehicleData.base_price_inr),
                  original_price: parseFloat(vehicleData.base_price_inr)
                };
                console.log('[DEBUG] Enriched vehicle:', enrichedData);
                return enrichedData;
              } else {
                console.log('[DEBUG] Vehicle not found in DB:', selectedVehicle.vehicle_id);
              }
            } catch (err) {
              console.error(`Error fetching vehicle ${selectedVehicle.vehicle_id}:`, err);
            }
          }
          // Fallback if vehicle not found or no vehicle_id
          console.log('[DEBUG] Returning original vehicle:', selectedVehicle);
          return selectedVehicle;
        })
      );

      console.log('[DEBUG] Final enriched vehicles:', enrichedVehicles);
      booking.selected_vehicles = enrichedVehicles;
    }

    // Enrich selected_addons with full details from addons table
    if (booking.selected_addons && Array.isArray(booking.selected_addons)) {
      console.log('[DEBUG] Enriching', booking.selected_addons.length, 'addons...');
      const enrichedAddons = await Promise.all(
        booking.selected_addons.map(async (selectedAddon) => {
          if (selectedAddon.addon_id) {
            try {
              const addonResult = await db.query(
                'SELECT id, name, price, price_per_person, description FROM addons WHERE id = $1',
                [selectedAddon.addon_id]
              );

              if (addonResult.rows.length > 0) {
                const addonData = addonResult.rows[0];
                const enrichedData = {
                  addon_id: selectedAddon.addon_id,
                  name: addonData.name,
                  addon_name: addonData.name,
                  quantity: selectedAddon.quantity || 1,
                  price: parseFloat(addonData.price),
                  original_price: parseFloat(addonData.price),
                  price_per_person: addonData.price_per_person,
                  description: addonData.description
                };
                console.log('[DEBUG] Enriched addon:', enrichedData);
                return enrichedData;
              } else {
                console.log('[DEBUG] Addon not found in DB:', selectedAddon.addon_id);
              }
            } catch (err) {
              console.error(`Error fetching addon ${selectedAddon.addon_id}:`, err);
            }
          }
          // Fallback if addon not found or no addon_id
          console.log('[DEBUG] Returning original addon:', selectedAddon);
          return selectedAddon;
        })
      );

      console.log('[DEBUG] Final enriched addons:', enrichedAddons);
      booking.selected_addons = enrichedAddons;
    }

    console.log('[DEBUG] Final booking data being sent to client');
    console.log('[DEBUG] Vehicles:', JSON.stringify(booking.selected_vehicles));
    console.log('[DEBUG] Addons:', JSON.stringify(booking.selected_addons));

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(`Error fetching booking #${id}:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// --- NEW FUNCTION (Admin): Delete a booking ---
exports.deleteBooking = async (req, res) => {
  const { bookingId } = req.params;

  console.log('=== DELETE BOOKING REQUEST ===');
  console.log('Booking ID:', bookingId);
  console.log('Request params:', req.params);

  try {
    // Verify booking exists
    console.log('Checking if booking exists...');
    const bookingResult = await db.query(
      "SELECT * FROM bookings WHERE id = $1",
      [bookingId]
    );

    console.log('Query result:', bookingResult.rows);

    if (bookingResult.rows.length === 0) {
      console.log('Booking not found');
      return res.status(404).json({
        success: false,
        error: "Booking not found."
      });
    }

    const booking = bookingResult.rows[0];
    console.log('Booking found:', { id: booking.id, status: booking.status });

    // Business rule: Can only delete if not confirmed or completed
    // Prevent deletion of bookings with Payment Confirmed or Trip Completed status
    if (booking.status === 'Payment Confirmed' || booking.status === 'Trip Completed') {
      console.log('Cannot delete - booking is confirmed or completed');
      return res.status(400).json({
        success: false,
        error: `Cannot delete booking with status '${booking.status}'. Only Inquiry Pending, Under Review, Quote Sent, or Cancelled bookings can be deleted.`,
      });
    }

    // Delete the booking (CASCADE will handle related records)
    console.log('Deleting booking...');
    await db.query("DELETE FROM bookings WHERE id = $1", [bookingId]);
    console.log('Booking deleted successfully');

    // Log activity
    try {
      await logUserActivity(booking.user_id, "Booking Deleted by Admin", { bookingId });
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Continue even if logging fails
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully!",
    });
  } catch (error) {
    console.error(`Error deleting booking #${bookingId}:`, error);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message
    });
  }
};
