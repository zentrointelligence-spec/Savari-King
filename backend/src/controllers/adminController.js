const db = require("../db");
const { logAdminAction, getAuditLogs } = require("../services/auditLogService");
const { generateToken } = require("../utils/tokenUtils");
const { sendPasswordResetEmail } = require("../services/emailService");
const { logActionWithContext } = require("../middleware/auditMiddleware");

// ======================================================================
// This file contains controllers for administrative actions.
// ======================================================================

exports.getLayoutStats = async (req, res) => {
  try {
    const [
      pendingInquiries,
      totalBookings,
      pendingUsers,
      pendingReviews,
      pendingResets,
      monthlyRevenue,
      totalRevenue,
      activeUsers,
      totalTours,
      activeTours,
    ] = await Promise.all([
      db.query(
        "SELECT COUNT(*) FROM bookings WHERE status = 'Inquiry Pending'"
      ),
      db.query("SELECT COUNT(*) FROM bookings"),
      db.query("SELECT COUNT(*) FROM users WHERE is_verified = false"),
      db.query("SELECT COUNT(*) FROM Reviews WHERE is_approved = false"),
      db.query("SELECT COUNT(*) FROM PasswordResets WHERE status = 'pending'"),
      db.query(`
        SELECT COALESCE(SUM(final_price), 0) as revenue
        FROM bookings
        WHERE status = 'Payment Confirmed'
        AND DATE_TRUNC('month', payment_timestamp) = DATE_TRUNC('month', CURRENT_DATE)
      `),
      db.query(`
        SELECT COALESCE(SUM(final_price), 0) as revenue
        FROM bookings
        WHERE status = 'Payment Confirmed'
      `),
      db.query(
        "SELECT COUNT(*) FROM users WHERE is_verified = true AND creation_date >= CURRENT_DATE - INTERVAL '30 days'"
      ),
      db.query("SELECT COUNT(*) FROM tours"),
      db.query("SELECT COUNT(*) FROM tours WHERE is_active = true"),
    ]);

    res.status(200).json({
      dashboard: parseInt(pendingInquiries.rows[0].count, 10),
      bookings: parseInt(totalBookings.rows[0].count, 10),
      users: parseInt(pendingUsers.rows[0].count, 10),
      reviews: parseInt(pendingReviews.rows[0].count, 10),
      security: parseInt(pendingResets.rows[0].count, 10),
      revenue: {
        monthly: parseFloat(monthlyRevenue.rows[0].revenue || 0),
        total: parseFloat(totalRevenue.rows[0].revenue || 0),
      },
      user_stats: {
        active_users: parseInt(activeUsers.rows[0].count, 10),
      },
      tour_stats: {
        total_tours: parseInt(totalTours.rows[0].count, 10),
        active_tours: parseInt(activeTours.rows[0].count, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching layout stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createTour = async (req, res) => {
  const {
    name,
    slug,
    main_image_url,
    itinerary,
    is_active,
    is_new,
    duration_days,
    category,
    destinations,
    themes,
    rating,
    review_count,
  } = req.body;

  if (!name || !slug) {
    return res
      .status(400)
      .json({ error: "Name and slug are required fields." });
  }

  try {
    const newTour = await db.query(
      `INSERT INTO Tours
        (name, slug, main_image_url, itinerary, is_active, is_new, duration_days, category, destinations, themes, rating, review_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        name,
        slug,
        main_image_url,
        itinerary,
        is_active,
        is_new,
        duration_days,
        category,
        destinations,
        themes,
        rating,
        review_count,
      ]
    );

    await logAdminAction(
      req.user.id,
      "CREATE",
      "Tour",
      newTour.rows[0].id,
      { name: newTour.rows[0].name },
      req.ip,
      req.get("User-Agent")
    );

    res.status(201).json(newTour.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      // Unique constraint violation for slug
      return res
        .status(409)
        .json({ error: "A tour with this slug already exists." });
    }
    console.error("Error creating new tour:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- NEW FUNCTION: Update a Tour ---
/**
 * @description Updates an existing tour.
 * @route PUT /api/admin/tours/:tourId
 * @access Private/Admin
 */
exports.updateTour = async (req, res) => {
  const { tourId } = req.params;
  const {
    name,
    slug,
    main_image_url,
    itinerary,
    is_active,
    is_new,
    duration_days,
    category,
    destinations,
    themes,
    rating,
    review_count,
  } = req.body;

  try {
    const updatedTour = await db.query(
      `UPDATE Tours SET
        name = $1, slug = $2, main_image_url = $3, itinerary = $4, is_active = $5, is_new = $6,
        duration_days = $7, category = $8, destinations = $9, themes = $10, rating = $11, review_count = $12
      WHERE id = $13 RETURNING *`,
      [
        name,
        slug,
        main_image_url,
        itinerary,
        is_active,
        is_new,
        duration_days,
        category,
        destinations,
        themes,
        rating,
        review_count,
        tourId,
      ]
    );

    if (updatedTour.rowCount === 0) {
      return res.status(404).json({ error: "Tour not found." });
    }

    // Log the action in the audit log
    await logAdminAction(
      req.user.id,
      "UPDATE",
      "Tour",
      tourId,
      {
        name: updatedTour.rows[0].name,
      },
      req.ip || req.connection.remoteAddress,
      req.get("User-Agent")
    );

    res.status(200).json(updatedTour.rows[0]);
  } catch (error) {
    console.error(`Error updating tour #${tourId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Delete a Tour ---
/**
 * @description Deletes a tour from the database.
 * @route DELETE /api/admin/tours/:tourId
 * @access Private/Admin
 */
exports.deleteTour = async (req, res) => {
  const { tourId } = req.params; // Get the ID from the URL

  try {
    // ON DELETE CASCADE will handle deleting related records (e.g., bookings, reviews).
    const deleteOp = await db.query(
      "DELETE FROM Tours WHERE id = $1 RETURNING name",
      [tourId]
    );

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: "Tour not found." });
    }

    // Log the action in the audit log
    const tourName = deleteOp.rows[0].name;
    await logAdminAction(
      req.user.id,
      "DELETE",
      "Tour",
      tourId,
      {
        name: tourName,
      },
      req.ip || req.connection.remoteAddress,
      req.get("User-Agent")
    );

    res
      .status(200)
      .json({ message: `Tour '${tourName}' was deleted successfully.` });
  } catch (error) {
    console.error(`Error deleting tour #${tourId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Vehicle Management ---
/**
 * @description Creates a new vehicle.
 * @route POST /api/admin/vehicles
 * @access Private/Admin
 */
exports.createVehicle = async (req, res) => {
  // Get information from the admin form
  const { name, capacity, price_per_day } = req.body;
  try {
    // Execute the SQL query to insert the new vehicle
    const newVehicle = await db.query(
      "INSERT INTO Vehicles (name, capacity, price_per_day) VALUES ($1, $2, $3) RETURNING *",
      [name, capacity, price_per_day]
    );
    const createdVehicle = newVehicle.rows[0];

    // Log this action in the audit log
    await logAdminAction(
      req.user.id,
      "CREATE",
      "Vehicle",
      createdVehicle.id,
      {
        name: createdVehicle.name,
      },
      req.ip || req.connection.remoteAddress,
      req.get("User-Agent")
    );

    // Return a success response with the created vehicle's data
    res.status(201).json(createdVehicle);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const pendingInquiries = await db.query(
      "SELECT COUNT(*) FROM bookings WHERE status = 'Inquiry Pending'"
    );
    const monthlyRevenue = await db.query(
      `SELECT SUM(total_price) as revenue FROM bookings 
           WHERE status = 'Payment Confirmed' AND date_trunc('month', payment_timestamp) = date_trunc('month', current_date)`
    );
    const totalCustomers = await db.query(
      "SELECT COUNT(DISTINCT user_id) FROM bookings"
    );
    const recentInquiries = await db.query(`
          SELECT b.id, b.status, u.full_name as user_name, t.name as tour_name
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          JOIN Tours t ON b.tour_id = t.id
          ORDER BY b.inquiry_date DESC
          LIMIT 5
      `);

    res.status(200).json({
      pending_inquiries: parseInt(pendingInquiries.rows[0].count, 10),
      monthly_revenue: parseFloat(monthlyRevenue.rows[0].revenue || 0),
      total_customers: parseInt(totalCustomers.rows[0].count, 10),
      recent_inquiries: recentInquiries.rows,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Gestion des Niveaux de Service (Tiers) ---
exports.createPackageTier = async (req, res) => {
  const {
    tour_id,
    tier_name,
    price,
    hotel_type,
    included_vehicle_id,
    inclusions_summary,
  } = req.body;
  try {
    const newTier = await db.query(
      `INSERT INTO PackageTiers (tour_id, tier_name, price, hotel_type, included_vehicle_id, inclusions_summary) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        tour_id,
        tier_name,
        price,
        hotel_type,
        included_vehicle_id,
        inclusions_summary,
      ]
    );
    const createdTier = newTier.rows[0];
    await logAdminAction(req.user.id, "CREATE", "PackageTier", createdTier.id, {
      name: createdTier.tier_name,
      tour_id: createdTier.tour_id,
    });
    res.status(201).json(createdTier);
  } catch (error) {
    console.error("Error creating package tier:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Gestion des Add-Ons ---
exports.createAddon = async (req, res) => {
  const { name, price, description } = req.body;
  try {
    const newAddon = await db.query(
      "INSERT INTO AddOns (name, price, description) VALUES ($1, $2, $3) RETURNING *",
      [name, price, description]
    );
    const createdAddon = newAddon.rows[0];
    await logAdminAction(req.user.id, "CREATE", "AddOn", createdAddon.id, {
      name: createdAddon.name,
    });
    res.status(201).json(createdAddon);
  } catch (error) {
    console.error("Error creating addon:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Lier un Add-On à un Tour ---
exports.linkAddonToTour = async (req, res) => {
  const { tour_id, addon_id } = req.body;
  try {
    await db.query(
      "INSERT INTO TourAddOns (tour_id, addon_id) VALUES ($1, $2)",
      [tour_id, addon_id]
    );
    await logAdminAction(req.user.id, "LINK", "TourAddOn", null, {
      tour_id,
      addon_id,
    });
    res.status(201).json({ message: "Add-on successfully linked to tour." });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: "This add-on is already linked to this tour." });
    }
    console.error("Error linking addon to tour:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Délier un Add-On d'un Tour ---
exports.unlinkAddonFromTour = async (req, res) => {
  const { tour_id, addon_id } = req.body;
  if (!tour_id || !addon_id) {
    return res
      .status(400)
      .json({ error: "tour_id and addon_id are required." });
  }
  try {
    const result = await db.query(
      "DELETE FROM TourAddOns WHERE tour_id = $1 AND addon_id = $2",
      [tour_id, addon_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "This link between the tour and add-on does not exist.",
      });
    }
    await logAdminAction(req.user.id, "UNLINK", "TourAddOn", null, {
      tour_id,
      addon_id,
    });
    res
      .status(200)
      .json({ message: "Add-on successfully unlinked from tour." });
  } catch (error) {
    console.error("Error unlinking addon from tour:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Récupérer toutes les réservations pour le tableau de bord ---
exports.getAllBookings = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    startDate,
    endDate,
    sortKey = "id",
    sortDirection = "desc",
  } = req.query;

  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1 = 1";
  const queryParams = [];

  if (search) {
    queryParams.push(`%${search}%`);
    const searchCondition = `(u.full_name ILIKE $${queryParams.length} OR u.email ILIKE $${queryParams.length} OR t.name ILIKE $${queryParams.length} OR b.id::text ILIKE $${queryParams.length})`;
    whereClause += ` AND ${searchCondition}`;
  }

  if (status && status !== "all") {
    queryParams.push(status);
    whereClause += ` AND b.status = $${queryParams.length}`;
  }

  if (startDate) {
    queryParams.push(startDate);
    whereClause += ` AND b.inquiry_date >= $${queryParams.length}`;
  }

  if (endDate) {
    queryParams.push(endDate);
    whereClause += ` AND b.inquiry_date <= $${queryParams.length}`;
  }

  const validSortKeys = ["id", "travel_date", "status"];
  const sortColumn = validSortKeys.includes(sortKey) ? `b.${sortKey}` : "b.id";
  const sortOrder = sortDirection.toLowerCase() === "asc" ? "ASC" : "DESC";

  try {
    const bookingsQuery = await db.query(
      `SELECT
        b.id, b.status, b.travel_date, b.number_of_persons, b.total_price, b.selected_currency,
        u.full_name as user_name, u.email as user_email,
        t.name as tour_name
      FROM Bookings b
      JOIN users u ON b.user_id = u.id
      JOIN Tours t ON b.tour_id = t.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset]
    );

    const totalBookingsQuery = await db.query(
      `SELECT COUNT(*) FROM Bookings b JOIN users u ON b.user_id = u.id JOIN Tours t ON b.tour_id = t.id ${whereClause}`,
      queryParams
    );
    const totalBookings = parseInt(totalBookingsQuery.rows[0].count, 10);

    res.status(200).json({
      bookings: bookingsQuery.rows,
      totalPages: Math.ceil(totalBookings / limit),
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Fonctions pour récupérer les listes du catalogue ---
exports.getAllVehicles = async (req, res) => {
  const { page = 1, limit = 10, searchTerm } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = "";
  const queryParams = [];

  if (searchTerm) {
    queryParams.push(`%${searchTerm}%`);
    whereClause = `WHERE name ILIKE $1`;
  }

  try {
    const vehiclesQuery = await db.query(
      `SELECT * FROM Vehicles ${whereClause} ORDER BY id ASC LIMIT $${
        queryParams.length + 1
      } OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset]
    );

    const totalVehiclesQuery = await db.query(
      `SELECT COUNT(*) FROM Vehicles ${whereClause}`,
      queryParams
    );
    const totalVehicles = parseInt(totalVehiclesQuery.rows[0].count, 10);

    res.status(200).json({
      vehicles: vehiclesQuery.rows,
      totalPages: Math.ceil(totalVehicles / limit),
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllAddons = async (req, res) => {
  const { page = 1, limit = 10, searchTerm } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = "";
  const queryParams = [];

  if (searchTerm) {
    queryParams.push(`%${searchTerm}%`);
    whereClause = `WHERE name ILIKE $1 OR description ILIKE $1`;
  }

  try {
    const addonsQuery = await db.query(
      `SELECT * FROM AddOns ${whereClause} ORDER BY id ASC LIMIT $${
        queryParams.length + 1
      } OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset]
    );

    const totalAddonsQuery = await db.query(
      `SELECT COUNT(*) FROM AddOns ${whereClause}`,
      queryParams
    );
    const totalAddons = parseInt(totalAddonsQuery.rows[0].count, 10);

    res.status(200).json({
      addons: addonsQuery.rows,
      totalPages: Math.ceil(totalAddons / limit),
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    console.error("Error fetching addons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 10;
  const { searchTerm, role, status, verificationStatus } = req.query;

  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1 = 1";
  const queryParams = [];

  if (searchTerm) {
    queryParams.push(`%${searchTerm}%`);
    whereClause += ` AND (full_name ILIKE $${queryParams.length} OR email ILIKE $${queryParams.length})`;
  }

  if (role && role !== "all") {
    queryParams.push(role);
    whereClause += ` AND role = $${queryParams.length}`;
  }

  if (status && status !== "all") {
    queryParams.push(status === "active");
    whereClause += ` AND is_active = $${queryParams.length}`;
  }

  if (verificationStatus && verificationStatus !== "all") {
    queryParams.push(verificationStatus === "verified");
    whereClause += ` AND is_verified = $${queryParams.length}`;
  }

  try {
    const usersQuery = await db.query(
      `SELECT id, full_name, email, role, is_verified, creation_date, activity_count, recent_activities, is_active
       FROM users 
       ${whereClause}
       ORDER BY id ASC
       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset]
    );

    const totalUsersQuery = await db.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      queryParams
    );
    const totalUsers = parseInt(totalUsersQuery.rows[0].count, 10);

    res.status(200).json({
      users: usersQuery.rows,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { name, capacity, price_per_day } = req.body;
  try {
    const result = await db.query(
      "UPDATE Vehicles SET name = $1, capacity = $2, price_per_day = $3 WHERE id = $4 RETURNING *",
      [name, capacity, price_per_day, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Vehicle not found." });
    await logAdminAction(req.user.id, "UPDATE", "Vehicle", id, { name });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM Vehicles WHERE id = $1 RETURNING name",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Vehicle not found." });
    await logAdminAction(req.user.id, "DELETE", "Vehicle", id, {
      name: result.rows[0].name,
    });
    res.status(200).json({ message: "Vehicle deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateAddon = async (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;
  try {
    const result = await db.query(
      "UPDATE AddOns SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *",
      [name, price, description, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Add-on not found." });
    await logAdminAction(req.user.id, "UPDATE", "AddOn", id, { name });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteAddon = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM AddOns WHERE id = $1 RETURNING name",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Add-on not found." });
    await logAdminAction(req.user.id, "DELETE", "AddOn", id, {
      name: result.rows[0].name,
    });
    res.status(200).json({ message: "Add-on deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllReviews = async (req, res) => {
  const { page = 1, limit = 10, searchTerm, status, rating } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1 = 1";
  const queryParams = [];

  if (searchTerm) {
    queryParams.push(`%${searchTerm}%`);
    const searchCondition = `(u.full_name ILIKE $${queryParams.length} OR t.name ILIKE $${queryParams.length} OR r.review_text ILIKE $${queryParams.length})`;
    whereClause += ` AND ${searchCondition}`;
  }

  if (status && status !== "all") {
    queryParams.push(status === "approved");
    whereClause += ` AND r.is_approved = $${queryParams.length}`;
  }

  if (rating && rating !== "all") {
    queryParams.push(rating);
    whereClause += ` AND r.rating = $${queryParams.length}`;
  }

  try {
    const reviewsQuery = await db.query(
      `
          SELECT r.id, r.rating, r.review_text, r.is_approved, r.submission_date as date, u.full_name as user_name, t.name as tour_name
          FROM Reviews r
          JOIN users u ON r.user_id = u.id
          JOIN Tours t ON r.tour_id = t.id
          ${whereClause}
          ORDER BY r.submission_date DESC
          LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `,
      [...queryParams, limit, offset]
    );

    const totalReviewsQuery = await db.query(
      `SELECT COUNT(*) FROM Reviews r JOIN users u ON r.user_id = u.id JOIN Tours t ON r.tour_id = t.id ${whereClause}`,
      queryParams
    );
    const totalReviews = parseInt(totalReviewsQuery.rows[0].count, 10);

    res.status(200).json({
      reviews: reviewsQuery.rows,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Approuver un avis
exports.approveReview = async (req, res) => {
  const { reviewId } = req.params;
  try {
    const result = await db.query(
      "UPDATE Reviews SET is_approved = true WHERE id = $1 RETURNING id",
      [reviewId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Review not found." });

    await logAdminAction(req.user.id, "APPROVE", "Review", reviewId);
    res.status(200).json({ message: "Review approved successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Supprimer un avis
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM Reviews WHERE id = $1 RETURNING id",
      [reviewId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Review not found." });

    await logAdminAction(req.user.id, "DELETE", "Review", reviewId);
    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Récupérer les demandes de reset en attente ---
exports.getPendingResets = async (req, res) => {
  const { searchTerm, status } = req.query;

  let whereClause = "WHERE 1 = 1";
  const queryParams = [];

  if (searchTerm) {
    queryParams.push(`%${searchTerm}%`);
    whereClause += ` AND (email ILIKE $${queryParams.length} OR id::text ILIKE $${queryParams.length})`;
  }

  if (status && status !== "all") {
    queryParams.push(status);
    whereClause += ` AND status = $${queryParams.length}`;
  } else if (status !== "all") {
    whereClause += ` AND status = 'pending'`;
  }

  try {
    const result = await db.query(
      `SELECT * FROM PasswordResets ${whereClause} ORDER BY id ASC`,
      queryParams
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Approuver une demande et envoyer l'email ---
exports.approveResetRequest = async (req, res) => {
  const { resetId } = req.params;
  try {
    const resetToken = generateToken();
    const expiresAt = new Date(Date.now() + 3600000); // Valide 1 heure

    const result = await db.query(
      "UPDATE PasswordResets SET status = 'approved', reset_token = $1, expires_at = $2 WHERE id = $3 AND status = 'pending' RETURNING email, user_id",
      [resetToken, expiresAt, resetId]
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ error: "Request not found or already processed." });

    const { email, user_id } = result.rows[0];
    await sendPasswordResetEmail(email, resetToken);
    await logAdminAction(req.user.id, "APPROVE", "PasswordReset", resetId, {
      user_email: email,
    });

    res.status(200).json({ message: `Reset link sent to ${email}.` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTourDetails = async (req, res) => {
  const { tourId } = req.params;
  try {
    // Requête pour les informations de base du tour
    const tourResult = await db.query("SELECT * FROM Tours WHERE id = $1", [
      tourId,
    ]);
    if (tourResult.rows.length === 0) {
      return res.status(404).json({ error: "Tour not found." });
    }

    // Requête pour les niveaux de service (tiers) associés
    const tiersResult = await db.query(
      "SELECT * FROM PackageTiers WHERE tour_id = $1 ORDER BY price ASC",
      [tourId]
    );

    // Requête pour les add-ons liés à ce tour
    const linkedAddonsResult = await db.query(
      `
          SELECT a.* FROM AddOns a
          JOIN TourAddOns ta ON a.id = ta.addon_id
          WHERE ta.tour_id = $1
          ORDER BY a.name ASC
      `,
      [tourId]
    );

    const tourDetails = {
      ...tourResult.rows[0],
      tiers: tiersResult.rows,
      addons: linkedAddonsResult.rows,
    };

    res.status(200).json(tourDetails);
  } catch (error) {
    console.error(`Error fetching details for tour #${tourId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getDashboardData = async (req, res) => {
  const { range = "monthly" } = req.query;

  // --- Construction des intervalles de temps pour les requêtes ---
  let interval;
  let previousIntervalStart;
  let truncLevel; // Niveau de troncature pour le regroupement des données

  switch (range) {
    case "daily":
      interval = "AND inquiry_date >= NOW() - INTERVAL '1 day'";
      previousIntervalStart = "NOW() - INTERVAL '2 days'";
      truncLevel = "hour"; // Grouper par heure pour daily
      break;
    case "weekly":
      interval = "AND inquiry_date >= NOW() - INTERVAL '7 days'";
      previousIntervalStart = "NOW() - INTERVAL '14 days'";
      truncLevel = "day"; // Grouper par jour pour weekly
      break;
    case "yearly":
      interval = "AND inquiry_date >= NOW() - INTERVAL '1 year'";
      previousIntervalStart = "NOW() - INTERVAL '2 years'";
      truncLevel = "month"; // Grouper par mois pour yearly
      break;
    case "monthly":
    default:
      interval = "AND inquiry_date >= NOW() - INTERVAL '30 days'";
      previousIntervalStart = "NOW() - INTERVAL '60 days'";
      truncLevel = "day"; // Grouper par jour pour monthly
      break;
  }

  try {
    // --- Exécution de toutes les requêtes en parallèle ---
    const [
      // Données de la période actuelle
      currentRevenueResult,
      currentInquiriesResult,
      newCustomersResult,
      totalCustomersResult, // Requête ajoutée pour le total
      // Données de la période précédente (pour les pourcentages de changement)
      prevRevenueResult,
      prevInquiriesResult,
      // Données pour les graphiques et listes
      revenueAnalyticsResult,
      prevRevenueAnalyticsResult, // Nouvelle requête pour période précédente
      inquiryDistributionResult,
      recentActivitiesResult,
      recentInquiriesResult,
      customerLocationsResult,
    ] = await Promise.all([
      // Période actuelle
      db.query(
        `SELECT COALESCE(SUM(final_price), 0) as total FROM bookings WHERE status = 'Payment Confirmed' ${interval.replace(
          "inquiry_date",
          "payment_timestamp"
        )}`
      ),
      db.query(`SELECT COUNT(*) as total FROM bookings WHERE 1=1 ${interval}`),
      db.query(
        `SELECT COUNT(DISTINCT b.user_id) as total
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         WHERE 1=1 ${interval}`
      ),
      db.query(
        `SELECT COUNT(DISTINCT b.user_id) as total
         FROM bookings b`
      ), // Count unique users who have made bookings
      // Période précédente
      db.query(
        `SELECT COALESCE(SUM(final_price), 0) as total FROM bookings WHERE status = 'Payment Confirmed' AND payment_timestamp BETWEEN ${previousIntervalStart} AND NOW() - INTERVAL '${
          range === "daily"
            ? "1 day"
            : range === "weekly"
            ? "7 days"
            : range === "monthly"
            ? "30 days"
            : "1 year"
        }'`
      ),
      db.query(
        `SELECT COUNT(*) as total FROM bookings WHERE inquiry_date BETWEEN ${previousIntervalStart} AND NOW() - INTERVAL '${
          range === "daily"
            ? "1 day"
            : range === "weekly"
            ? "7 days"
            : range === "monthly"
            ? "30 days"
            : "1 year"
        }'`
      ),
      // Graphiques et listes - Revenue analytics pour période actuelle avec série complète
      db.query(
        `WITH date_series AS (
          SELECT date_trunc('${truncLevel}', generate_series(
            NOW() - INTERVAL '${
              range === "daily"
                ? "1 day"
                : range === "weekly"
                ? "7 days"
                : range === "monthly"
                ? "30 days"
                : "1 year"
            }',
            NOW(),
            INTERVAL '1 ${truncLevel}'
          )) as date
        )
        SELECT
          ds.date,
          COALESCE(SUM(b.final_price), 0) as revenue
        FROM date_series ds
        LEFT JOIN bookings b ON date_trunc('${truncLevel}', b.payment_timestamp) = ds.date
          AND b.status = 'Payment Confirmed'
        GROUP BY ds.date
        ORDER BY ds.date`
      ),
      // Revenue analytics pour période précédente avec série complète
      db.query(
        `WITH date_series AS (
          SELECT date_trunc('${truncLevel}', generate_series(
            ${previousIntervalStart},
            NOW() - INTERVAL '${
              range === "daily"
                ? "1 day"
                : range === "weekly"
                ? "7 days"
                : range === "monthly"
                ? "30 days"
                : "1 year"
            }',
            INTERVAL '1 ${truncLevel}'
          )) as date
        )
        SELECT
          ds.date,
          COALESCE(SUM(b.final_price), 0) as revenue
        FROM date_series ds
        LEFT JOIN bookings b ON date_trunc('${truncLevel}', b.payment_timestamp) = ds.date
          AND b.status = 'Payment Confirmed'
        GROUP BY ds.date
        ORDER BY ds.date`
      ),
      db.query(
        `SELECT status, COUNT(*) FROM bookings WHERE 1=1 ${interval} GROUP BY status`
      ),
      db.query(
        `SELECT a.*, u.full_name as admin_name
         FROM audit_logs a
         LEFT JOIN users u ON a.admin_user_id = u.id
         WHERE u.role = 'administrator'
         ORDER BY a.timestamp DESC
         LIMIT 10`
      ),
      db.query(
        `SELECT b.id, b.status, b.inquiry_date as date, COALESCE(b.final_price, b.estimated_price) as value, u.full_name as user_name, u.email as user_email, t.name as tour_name, t.duration_days as duration FROM bookings b JOIN users u ON b.user_id = u.id JOIN tours t ON b.tour_id = t.id ORDER BY b.inquiry_date DESC LIMIT 5`
      ),
      // Query for customer locations - using users table for true customer geographic distribution
      db.query(
        `SELECT
          u.country as country,
          COUNT(DISTINCT u.id) as count
         FROM users u
         WHERE u.country IS NOT NULL AND u.country != ''
         GROUP BY u.country
         ORDER BY count DESC`
      ),
    ]);

    // --- Calcul des statistiques ---
    const currentRevenue = parseFloat(currentRevenueResult.rows[0].total || 0);
    const prevRevenue = parseFloat(prevRevenueResult.rows[0].total || 0);
    const currentInquiries = parseInt(currentInquiriesResult.rows[0].total, 10);
    const prevInquiries = parseInt(prevInquiriesResult.rows[0].total, 10);

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const inquiryDistribution = inquiryDistributionResult.rows.reduce(
      (acc, row) => {
        acc[row.status] = parseInt(row.count, 10);
        return acc;
      },
      {}
    );

    // Transform revenue analytics data for chart component with adaptive labels
    const formatLabel = (date, timeRange) => {
      const d = new Date(date);
      switch (timeRange) {
        case "daily":
          // Show hours for daily view
          return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
        case "weekly":
          // Show day and date for weekly view
          return d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        case "yearly":
          // Show month and year for yearly view
          return d.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
        case "monthly":
        default:
          // Show month and day for monthly view
          return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
      }
    };

    const revenueAnalytics = {
      labels: revenueAnalyticsResult.rows.map((row) =>
        formatLabel(row.date, range)
      ),
      values: revenueAnalyticsResult.rows.map((row) =>
        parseFloat(row.revenue || 0)
      ),
      previous_values: prevRevenueAnalyticsResult.rows.map((row) =>
        parseFloat(row.revenue || 0)
      ),
    };

    // Calculate conversion rate: (Payment Confirmed / Total Inquiries) × 100
    const paymentsConfirmed = inquiryDistribution["Payment Confirmed"] || 0;
    const conversionRate =
      currentInquiries > 0
        ? Math.round((paymentsConfirmed / currentInquiries) * 100 * 10) / 10 // Round to 1 decimal
        : 0;

    // Calculate previous period conversion for comparison
    const prevPaymentsQuery = await db.query(
      `SELECT COUNT(*) as total FROM bookings
       WHERE status = 'Payment Confirmed'
       AND inquiry_date BETWEEN ${previousIntervalStart}
       AND NOW() - INTERVAL '${
         range === "daily"
           ? "1 day"
           : range === "weekly"
           ? "7 days"
           : range === "monthly"
           ? "30 days"
           : "1 year"
       }'`
    );
    const prevPaymentsConfirmed = parseInt(prevPaymentsQuery.rows[0].total, 10);
    const prevConversionRate =
      prevInquiries > 0
        ? Math.round((prevPaymentsConfirmed / prevInquiries) * 100 * 10) / 10
        : 0;
    const conversionChange = calculateChange(
      conversionRate,
      prevConversionRate
    );

    // Transform audit_logs into readable recent activities
    const transformedActivities = recentActivitiesResult.rows.map(
      (activity) => {
        const actionMap = {
          CREATE: "created",
          UPDATE: "updated",
          DELETE: "deleted",
          APPROVE: "approved",
          REJECT: "rejected",
          TOGGLE_STATUS: "toggled status of",
          LINK: "linked",
          UNLINK: "unlinked",
        };

        const typeMap = {
          CREATE: "tour_created",
          APPROVE: "booking_confirmed",
          User: "new_customer",
          Booking: "booking_confirmed",
        };

        const action =
          actionMap[activity.action] || activity.action.toLowerCase();
        const entity = activity.target_entity.toLowerCase();
        const adminName = activity.admin_name || "Admin";

        return {
          title: `${adminName} ${action} ${entity}`,
          description: `${entity.charAt(0).toUpperCase() + entity.slice(1)} #${
            activity.entity_id || "N/A"
          }`,
          type:
            typeMap[activity.action] ||
            typeMap[activity.target_entity] ||
            "booking_confirmed",
          timestamp: activity.timestamp,
        };
      }
    );

    // CORRECTION : On utilise la variable correcte 'totalCustomersResult'
    res.status(200).json({
      pending_inquiries: inquiryDistribution["Inquiry Pending"] || 0,
      monthly_revenue: currentRevenue,
      total_customers: parseInt(totalCustomersResult.rows[0].total, 10),
      new_customers: parseInt(newCustomersResult.rows[0].total, 10),
      inquiry_change: calculateChange(currentInquiries, prevInquiries),
      revenue_change: calculateChange(currentRevenue, prevRevenue),
      conversion_rate: conversionRate,
      conversion_change: conversionChange,
      revenue_analytics: revenueAnalytics,
      inquiry_distribution: inquiryDistribution,
      customer_locations: customerLocationsResult.rows,
      recent_activities: transformedActivities,
      recent_inquiries: recentInquiriesResult.rows,
      total_inquiries: currentInquiries,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllToursAdmin = async (req, res) => {
  const { page = 1, limit = 10, searchTerm, status, category } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1 = 1";
  const queryParams = [];

  if (searchTerm) {
    queryParams.push(`%${searchTerm}%`);
    const searchCondition = `(t.name ILIKE $${queryParams.length} OR t.category ILIKE $${queryParams.length} OR EXISTS (SELECT 1 FROM unnest(t.destinations) AS d WHERE d ILIKE $${queryParams.length}))`;
    whereClause += ` AND ${searchCondition}`;
  }

  if (status && status !== "all") {
    queryParams.push(status === "active");
    whereClause += ` AND t.is_active = $${queryParams.length}`;
  }

  if (category) {
    queryParams.push(category);
    whereClause += ` AND t.category = $${queryParams.length}`;
  }

  try {
    const toursQuery = `
      SELECT
          t.id, t.name, t.main_image_url, t.itinerary, t.is_active, t.duration_days, t.category, t.destinations, t.slug,
          COALESCE(MIN(pt.price), 0) as price,
          (SELECT COUNT(*) FROM Bookings b WHERE b.tour_id = t.id) as booking_count
      FROM Tours t
      LEFT JOIN PackageTiers pt ON t.id = pt.tour_id
      ${whereClause}
      GROUP BY t.id
      ORDER BY t.id DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    const toursResult = await db.query(toursQuery, [
      ...queryParams,
      limit,
      offset,
    ]);

    const totalToursQuery = `SELECT COUNT(DISTINCT t.id) FROM Tours t ${whereClause}`;
    const totalToursResult = await db.query(totalToursQuery, queryParams);
    const totalTours = parseInt(totalToursResult.rows[0].count, 10);

    const toursWithBookings = toursResult.rows.map((tour) => ({
      ...tour,
      bookings: Array(parseInt(tour.booking_count, 10)).fill({}),
    }));

    res.status(200).json({
      tours: toursWithBookings,
      totalPages: Math.ceil(totalTours / limit),
      currentPage: parseInt(page, 10),
      totalTours: totalTours,
    });
  } catch (error) {
    console.error("Error fetching all tours for admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.toggleTourStatus = async (req, res) => {
  const { tourId } = req.params;
  const { is_active } = req.body;

  try {
    const result = await db.query(
      "UPDATE Tours SET is_active = $1 WHERE id = $2 RETURNING *",
      [is_active, tourId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Tour not found." });
    }
    await logAdminAction(req.user.id, "TOGGLE_STATUS", "Tour", tourId, {
      new_status: is_active,
    });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error toggling status for tour #${tourId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { full_name, email, role, is_verified, is_active } = req.body;

  try {
    const updatedUser = await db.query(
      `UPDATE users SET full_name = $1, email = $2, role = $3, is_verified = $4, is_active = $5
       WHERE id = $6 RETURNING id, full_name, email, role, is_verified, is_active`,
      [full_name, email, role, is_verified, is_active, userId]
    );

    if (updatedUser.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    await logAdminAction(
      req.user.id,
      "UPDATE",
      "User",
      userId,
      { full_name, email, role, is_verified, is_active },
      req.ip || req.connection.remoteAddress,
      req.get("User-Agent")
    );

    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    console.error(`Error updating user #${userId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const { sendEmail } = require("../services/mailerService");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  const { full_name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const newUser = await db.query(
      `INSERT INTO users (full_name, email, password, role, is_verified, is_active)
       VALUES ($1, $2, $3, $4, false, true)
       RETURNING id, full_name, email, role, is_verified, is_active, creation_date`,
      [full_name, email, hashedPassword, role]
    );

    // Log admin action
    await logAdminAction(
      req.user.id,
      "CREATE",
      "User",
      newUser.rows[0].id,
      { email },
      req.ip || req.connection.remoteAddress,
      req.get("User-Agent")
    );

    // Send welcome email
    try {
      const welcomeSubject = "Welcome to Ebenezer Tours";
      const welcomeMessage = `
        <p>Hello ${full_name},</p>
        <p>An administrator has created an account for you on Ebenezer Tours.</p>
        <p>Your login details are:</p>
        <ul>
          <li>Email: ${email}</li>
          <li>Password: ${password}</li>
        </ul>
        <p>We recommend you change your password after your first login.</p>
        <p>Thank you!</p>
      `;
      await sendEmail(email, welcomeSubject, welcomeMessage);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Do not block user creation if email fails.
      // The error is logged for debugging.
    }

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.sendAdminEmail = async (req, res) => {
  const { userId } = req.params;
  const { subject, message } = req.body;
  const adminId = req.user.id;

  try {
    const user = await db.query(
      "SELECT email, full_name FROM users WHERE id = $1",
      [userId]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    const { email: userEmail, full_name: userFullName } = user.rows[0];

    const html = `<p>Hello ${userFullName},</p><p>${message}</p><p>Regards,<br/>The Ebenezer Tours Team</p>`;

    await sendEmail(userEmail, subject, html);

    await logAdminAction(
      adminId,
      "SEND_EMAIL",
      "User",
      userId,
      { subject },
      req.ip || req.connection.remoteAddress,
      req.get("User-Agent")
    );

    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error(`Error sending email to user #${userId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  // Sécurité : Empêcher un admin de se supprimer lui-même.
  if (parseInt(userId, 10) === req.user.id) {
    return res
      .status(400)
      .json({ error: "Administrators cannot delete their own account." });
  }

  try {
    const userToDelete = await db.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );
    if (
      userToDelete.rows.length > 0 &&
      userToDelete.rows[0].role === "administrator"
    ) {
      return res
        .status(403)
        .json({ error: "Cannot delete an administrator account." });
    }
    // ON DELETE CASCADE s'occupera de supprimer les réservations et autres données liées.
    const deleteOp = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING email",
      [userId]
    );

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    // Enregistrement de l'action dans le journal d'audit
    const userEmail = deleteOp.rows[0].email;
    await logAdminAction(req.user.id, "DELETE", "User", userId, {
      email: userEmail,
    });

    res
      .status(200)
      .json({ message: `User '${userEmail}' was deleted successfully.` });
  } catch (error) {
    console.error(`Error deleting user #${userId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const [
      totalUsersResult,
      activeUsersResult,
      pendingVerificationResult,
      adminUsersResult,
      newUsersTodayResult,
      newUsersThisMonthResult,
      newUsersLastMonthResult,
      activeUsersThisMonthResult,
      activeUsersLastMonthResult,
    ] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users"),
      db.query("SELECT COUNT(*) FROM users WHERE is_active = true"),
      db.query("SELECT COUNT(*) FROM users WHERE is_verified = false"),
      db.query("SELECT COUNT(*) FROM users WHERE role = 'administrator'"),
      db.query(
        "SELECT COUNT(*) FROM users WHERE creation_date >= NOW() - INTERVAL '1 day'"
      ),
      db.query(
        "SELECT COUNT(*) FROM users WHERE creation_date >= date_trunc('month', NOW())"
      ),
      db.query(
        "SELECT COUNT(*) FROM users WHERE creation_date >= date_trunc('month', NOW() - INTERVAL '1 month') AND creation_date < date_trunc('month', NOW())"
      ),
      db.query(
        "SELECT COUNT(*) FROM users WHERE is_active = true AND creation_date >= date_trunc('month', NOW())"
      ),
      db.query(
        "SELECT COUNT(*) FROM users WHERE is_active = true AND creation_date >= date_trunc('month', NOW() - INTERVAL '1 month') AND creation_date < date_trunc('month', NOW())"
      ),
    ]);

    const newUsersThisMonth = parseInt(
      newUsersThisMonthResult.rows[0].count,
      10
    );
    const newUsersLastMonth = parseInt(
      newUsersLastMonthResult.rows[0].count,
      10
    );
    const activeUsersThisMonth = parseInt(
      activeUsersThisMonthResult.rows[0].count,
      10
    );
    const activeUsersLastMonth = parseInt(
      activeUsersLastMonthResult.rows[0].count,
      10
    );

    const calculateGrowth = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      total_users: parseInt(totalUsersResult.rows[0].count, 10),
      active_users: parseInt(activeUsersResult.rows[0].count, 10),
      pending_verification: parseInt(
        pendingVerificationResult.rows[0].count,
        10
      ),
      admin_users: parseInt(adminUsersResult.rows[0].count, 10),
      new_users_today: parseInt(newUsersTodayResult.rows[0].count, 10),
      user_growth: calculateGrowth(newUsersThisMonth, newUsersLastMonth),
      active_growth: calculateGrowth(
        activeUsersThisMonth,
        activeUsersLastMonth
      ),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPendingUsersCount = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT COUNT(*) FROM users WHERE is_verified = false"
    );
    res.status(200).json({ count: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.toggleUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { is_active } = req.body;

  // Sécurité : Empêcher un admin de désactiver son propre compte.
  if (parseInt(userId, 10) === req.user.id) {
    return res
      .status(400)
      .json({ error: "Administrators cannot change their own status." });
  }

  try {
    const result = await db.query(
      "UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *",
      [is_active, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    // Enregistrement de l'action dans le journal d'audit
    await logAdminAction(req.user.id, "TOGGLE_STATUS", "User", userId, {
      new_status: is_active,
    });

    res.status(200).json({ message: `User status updated successfully.` });
  } catch (error) {
    console.error(`Error toggling status for user #${userId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getReviewStats = async (req, res) => {
  try {
    // On exécute plusieurs requêtes en parallèle pour plus d'efficacité
    const [
      totalReviewsResult,
      pendingReviewsResult,
      averageRatingResult,
      fiveStarResult,
      distributionResult,
    ] = await Promise.all([
      db.query("SELECT COUNT(*) FROM Reviews"),
      db.query("SELECT COUNT(*) FROM Reviews WHERE is_approved = false"),
      db.query(
        "SELECT AVG(rating) as avg_rating FROM Reviews WHERE is_approved = true"
      ),
      db.query(
        "SELECT COUNT(*) FROM Reviews WHERE rating = 5 AND is_approved = true"
      ),
      // Cette requête compte le nombre d'avis pour chaque note (de 1 à 5)
      db.query(
        "SELECT rating, COUNT(*) FROM Reviews WHERE is_approved = true GROUP BY rating"
      ),
    ]);

    // On formate la distribution des notes pour le graphique
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distributionResult.rows.forEach((row) => {
      ratingDistribution[row.rating] = parseInt(row.count, 10);
    });

    // On formate la réponse finale
    const stats = {
      total_reviews: parseInt(totalReviewsResult.rows[0].count, 10),
      pending_reviews: parseInt(pendingReviewsResult.rows[0].count, 10),
      average_rating: parseFloat(averageRatingResult.rows[0].avg_rating || 0),
      five_star_reviews: parseInt(fiveStarResult.rows[0].count, 10),
      rating_distribution: ratingDistribution,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching review stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSecurityStats = async (req, res) => {
  try {
    const [pendingResets, approvedResets, totalUsers, unverifiedUsers] =
      await Promise.all([
        db.query(
          "SELECT COUNT(*) FROM PasswordResets WHERE status = 'pending'"
        ),
        db.query(
          "SELECT COUNT(*) FROM PasswordResets WHERE status = 'approved'"
        ),
        db.query("SELECT COUNT(*) FROM users"),
        db.query("SELECT COUNT(*) FROM users WHERE is_verified = false"),
      ]);
    res.status(200).json({
      pending_resets: parseInt(pendingResets.rows[0].count, 10),
      approved_resets_total: parseInt(approvedResets.rows[0].count, 10),
      total_users: parseInt(totalUsers.rows[0].count, 10),
      unverified_users: parseInt(unverifiedUsers.rows[0].count, 10),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSecurityLogs = async (req, res) => {
  try {
    // Utiliser le service d'audit avec filtres
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      action: req.query.action,
      entityType: req.query.entityType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const logs = await getAuditLogs(filters);

    // Formater les données pour correspondre aux attentes du frontend
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      event_type: log.action,
      description: `${log.action} ${log.target_entity}${
        log.entity_id ? ` #${log.entity_id}` : ""
      }`,
      user_email: log.admin_email || "System",
      user_role: "administrator",
      timestamp: log.timestamp,
      ip_address: log.ip_address || "Unknown",
      location: "Unknown", // À implémenter avec une API de géolocalisation
      details: log.details,
    }));

    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error("Error fetching security logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rejectResetRequest = async (req, res) => {
  const { resetId } = req.params;
  try {
    const result = await db.query(
      "UPDATE PasswordResets SET status = 'rejected' WHERE id = $1 AND status = 'pending' RETURNING email",
      [resetId]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Request not found or already processed." });
    }
    await logAdminAction(req.user.id, "REJECT", "PasswordReset", resetId, {
      user_email: result.rows[0].email,
    });
    res.status(200).json({
      message: `Reset request for ${result.rows[0].email} has been rejected.`,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Nouvelles fonctions d'analytics pour l'étape 3.4

// Analytics des tours
exports.getTourAnalytics = async (req, res) => {
  try {
    const { period = "30", tourId } = req.query;
    const periodDays = parseInt(period);

    let tourFilter = "";
    let params = [periodDays];

    if (tourId) {
      tourFilter = "AND ts.tour_id = $2";
      params.push(tourId);
    }

    // Analytics générales des tours
    const tourStats = await db.query(
      `
      SELECT 
        COUNT(DISTINCT ts.tour_id) as total_tours,
        AVG(ts.total_views) as avg_views_per_tour,
        AVG(ts.total_bookings) as avg_bookings_per_tour,
        AVG(ts.average_rating) as overall_avg_rating,
        SUM(ts.total_views) as total_views,
        SUM(ts.total_bookings) as total_bookings
      FROM tour_statistics ts
      JOIN tours t ON ts.tour_id = t.id
      WHERE t.is_active = true ${tourFilter}
    `,
      params.slice(tourId ? 0 : 1)
    );

    // Top tours par vues
    const topToursByViews = await db.query(
      `
      SELECT 
        t.id,
        t.title,
        t.slug,
        ts.total_views,
        ts.total_bookings,
        ts.average_rating,
        ts.conversion_rate
      FROM tour_statistics ts
      JOIN tours t ON ts.tour_id = t.id
      WHERE t.is_active = true ${tourFilter}
      ORDER BY ts.total_views DESC
      LIMIT 10
    `,
      params.slice(tourId ? 0 : 1)
    );

    // Top tours par réservations
    const topToursByBookings = await db.query(
      `
      SELECT 
        t.id,
        t.title,
        t.slug,
        ts.total_views,
        ts.total_bookings,
        ts.average_rating,
        ts.conversion_rate
      FROM tour_statistics ts
      JOIN tours t ON ts.tour_id = t.id
      WHERE t.is_active = true ${tourFilter}
      ORDER BY ts.total_bookings DESC
      LIMIT 10
    `,
      params.slice(tourId ? 0 : 1)
    );

    // Évolution des vues par jour (derniers 30 jours)
    const viewsTrend = await db.query(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views
      FROM user_activity_log
      WHERE activity_type = 'tour_view'
      AND created_at >= CURRENT_DATE - INTERVAL '${periodDays} days'
      ${tourId ? "AND tour_id = $1" : ""}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `,
      tourId ? [tourId] : []
    );

    res.json({
      overview: tourStats.rows[0],
      top_tours_by_views: topToursByViews.rows,
      top_tours_by_bookings: topToursByBookings.rows,
      views_trend: viewsTrend.rows,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des analytics tours:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Analytics des utilisateurs
exports.getUserAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const periodDays = parseInt(period);

    // Statistiques générales des utilisateurs
    const userStats = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '${periodDays} days' THEN 1 END) as new_users_period,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week
      FROM users
    `);

    // Utilisateurs les plus actifs
    const activeUsers = await db.query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        COUNT(b.id) as total_bookings,
        COUNT(uf.id) as total_favorites,
        MAX(ual.created_at) as last_activity
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      LEFT JOIN user_favorites uf ON u.id = uf.user_id
      LEFT JOIN user_activity_log ual ON u.id = ual.user_id
      WHERE u.is_verified = true
      GROUP BY u.id, u.full_name, u.email
      ORDER BY total_bookings DESC, total_favorites DESC
      LIMIT 10
    `);

    // Évolution des inscriptions
    const registrationTrend = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as registrations,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_registrations
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '${periodDays} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Répartition par pays
    const countryDistribution = await db.query(`
      SELECT 
        country,
        COUNT(*) as user_count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE is_verified = true), 2) as percentage
      FROM users
      WHERE is_verified = true AND country IS NOT NULL
      GROUP BY country
      ORDER BY user_count DESC
      LIMIT 10
    `);

    res.json({
      overview: userStats.rows[0],
      active_users: activeUsers.rows,
      registration_trend: registrationTrend.rows,
      country_distribution: countryDistribution.rows,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des analytics utilisateurs:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Santé du système
exports.getSystemHealth = async (req, res) => {
  try {
    // Vérifications de base de données
    const dbStats = await db.query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
      LIMIT 10
    `);

    // Taille de la base de données
    const dbSize = await db.query(`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        pg_database_size(current_database()) as database_size_bytes
    `);

    // Connexions actives
    const connections = await db.query(`
      SELECT 
        COUNT(*) as active_connections,
        COUNT(CASE WHEN state = 'active' THEN 1 END) as active_queries,
        COUNT(CASE WHEN state = 'idle' THEN 1 END) as idle_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    // Erreurs récentes (dernières 24h)
    const errorCount = await db.query(`
      SELECT COUNT(*) as error_count
      FROM audit_logs
      WHERE action_type = 'ERROR'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `);

    // Statut général
    const systemStatus = {
      status: "healthy",
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      node_version: process.version,
    };

    res.json({
      system_status: systemStatus,
      database: {
        size: dbSize.rows[0],
        connections: connections.rows[0],
        table_stats: dbStats.rows,
      },
      performance: {
        error_count_24h: errorCount.rows[0].error_count,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de la santé du système:",
      error
    );
    res.status(500).json({
      system_status: { status: "unhealthy" },
      error: "Erreur lors de la vérification du système",
    });
  }
};

// Analytics des revenus
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = "30", groupBy = "day" } = req.query;
    const periodDays = parseInt(period);

    // Revenus totaux et par période
    const revenueOverview = await db.query(`
      SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(final_price_inr), 0) as total_revenue,
        COALESCE(AVG(final_price_inr), 0) as average_booking_value,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '${periodDays} days' THEN 1 END) as bookings_period,
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '${periodDays} days' THEN final_price_inr ELSE 0 END), 0) as revenue_period
      FROM bookings
      WHERE status IN ('Confirmed', 'Completed')
    `);

    // Évolution des revenus
    let dateFormat = "DATE(created_at)";
    if (groupBy === "week") {
      dateFormat = "DATE_TRUNC('week', created_at)";
    } else if (groupBy === "month") {
      dateFormat = "DATE_TRUNC('month', created_at)";
    }

    const revenueTrend = await db.query(`
      SELECT 
        ${dateFormat} as period,
        COUNT(*) as bookings,
        COALESCE(SUM(final_price_inr), 0) as revenue,
        COALESCE(AVG(final_price_inr), 0) as avg_booking_value
      FROM bookings
      WHERE status IN ('Confirmed', 'Completed')
      AND created_at >= CURRENT_DATE - INTERVAL '${periodDays} days'
      GROUP BY ${dateFormat}
      ORDER BY period DESC
    `);

    // Revenus par tour
    const revenueByTour = await db.query(`
      SELECT 
        t.id,
        t.title,
        COUNT(b.id) as bookings,
        COALESCE(SUM(b.final_price_inr), 0) as revenue,
        COALESCE(AVG(b.final_price_inr), 0) as avg_booking_value
      FROM tours t
      LEFT JOIN bookings b ON t.id = b.tour_id AND b.status IN ('Confirmed', 'Completed')
      WHERE t.is_active = true
      AND (b.created_at IS NULL OR b.created_at >= CURRENT_DATE - INTERVAL '${periodDays} days')
      GROUP BY t.id, t.title
      ORDER BY revenue DESC
      LIMIT 10
    `);

    // Revenus par niveau de service
    const revenueByTier = await db.query(`
      SELECT 
        pt.tier_name,
        COUNT(b.id) as bookings,
        COALESCE(SUM(b.final_price_inr), 0) as revenue,
        COALESCE(AVG(b.final_price_inr), 0) as avg_booking_value
      FROM package_tiers pt
      LEFT JOIN bookings b ON pt.id = b.package_tier_id AND b.status IN ('Confirmed', 'Completed')
      WHERE b.created_at >= CURRENT_DATE - INTERVAL '${periodDays} days'
      GROUP BY pt.tier_name
      ORDER BY revenue DESC
    `);

    res.json({
      overview: revenueOverview.rows[0],
      revenue_trend: revenueTrend.rows,
      revenue_by_tour: revenueByTour.rows,
      revenue_by_tier: revenueByTier.rows,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des analytics revenus:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Fonction pour récupérer les logs d'audit avec filtres avancés
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      entityType,
      adminId,
      startDate,
      endDate,
      search,
    } = req.query;

    const filters = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      action,
      entityType,
      adminId: adminId ? parseInt(adminId) : null,
      startDate,
      endDate,
      search,
    };

    // Récupérer les logs avec le service d'audit
    const logs = await getAuditLogs(filters);

    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      WHERE 1=1
    `;
    const countParams = [];
    let paramIndex = 1;

    if (filters.action) {
      countQuery += ` AND al.action = $${paramIndex}`;
      countParams.push(filters.action);
      paramIndex++;
    }

    if (filters.entityType) {
      countQuery += ` AND al.target_entity = $${paramIndex}`;
      countParams.push(filters.entityType);
      paramIndex++;
    }

    if (filters.adminId) {
      countQuery += ` AND al.admin_id = $${paramIndex}`;
      countParams.push(filters.adminId);
      paramIndex++;
    }

    if (filters.startDate) {
      countQuery += ` AND al.timestamp >= $${paramIndex}`;
      countParams.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      countQuery += ` AND al.timestamp <= $${paramIndex}`;
      countParams.push(filters.endDate);
      paramIndex++;
    }

    if (filters.search) {
      countQuery += ` AND (u.full_name ILIKE $${paramIndex} OR al.action ILIKE $${paramIndex} OR al.target_entity ILIKE $${paramIndex})`;
      countParams.push(`%${filters.search}%`);
      paramIndex++;
    }

    const totalResult = await db.query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].total);
    const totalPages = Math.ceil(total / filters.limit);

    // Formater les logs pour le frontend
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity_type: log.target_entity,
      entity_id: log.entity_id,
      admin_name: log.admin_email || "Système",
      admin_id: log.admin_id,
      timestamp: log.timestamp,
      ip_address: log.ip_address || "Inconnu",
      user_agent: log.user_agent || "Inconnu",
      details: log.details,
      description: `${log.action} ${log.target_entity}${
        log.entity_id ? ` #${log.entity_id}` : ""
      }`,
    }));

    res.json({
      logs: formattedLogs,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: filters.limit,
        has_next: parseInt(page) < totalPages,
        has_prev: parseInt(page) > 1,
      },
      filters: {
        action: filters.action,
        entity_type: filters.entityType,
        admin_id: filters.adminId,
        start_date: filters.startDate,
        end_date: filters.endDate,
        search: filters.search,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des logs d'audit:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Fonction pour récupérer les statistiques d'audit
exports.getAuditStats = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const periodDays = parseInt(period);

    // Statistiques générales
    const generalStats = await db.query(`
      SELECT 
        COUNT(*) as total_actions,
        COUNT(DISTINCT admin_id) as active_admins,
        COUNT(CASE WHEN timestamp >= CURRENT_DATE - INTERVAL '${periodDays} days' THEN 1 END) as actions_period,
        COUNT(CASE WHEN timestamp >= CURRENT_DATE - INTERVAL '24 hours' THEN 1 END) as actions_24h
      FROM audit_logs
    `);

    // Actions par type
    const actionsByType = await db.query(`
      SELECT 
        action,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM audit_logs WHERE timestamp >= CURRENT_DATE - INTERVAL '${periodDays} days'), 2) as percentage
      FROM audit_logs
      WHERE timestamp >= CURRENT_DATE - INTERVAL '${periodDays} days'
      GROUP BY action
      ORDER BY count DESC
    `);

    // Entités les plus modifiées
    const entitiesByActivity = await db.query(`
      SELECT 
        target_entity,
        COUNT(*) as count,
        COUNT(DISTINCT entity_id) as unique_entities
      FROM audit_logs
      WHERE timestamp >= CURRENT_DATE - INTERVAL '${periodDays} days'
      GROUP BY target_entity
      ORDER BY count DESC
      LIMIT 10
    `);

    // Administrateurs les plus actifs
    const activeAdmins = await db.query(`
      SELECT 
        u.full_name,
        u.email,
        COUNT(al.id) as actions_count,
        MAX(al.timestamp) as last_action
      FROM audit_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      WHERE al.timestamp >= CURRENT_DATE - INTERVAL '${periodDays} days'
      GROUP BY u.id, u.full_name, u.email
      ORDER BY actions_count DESC
      LIMIT 10
    `);

    // Évolution des actions par jour
    const activityTrend = await db.query(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as actions,
        COUNT(DISTINCT admin_id) as active_admins
      FROM audit_logs
      WHERE timestamp >= CURRENT_DATE - INTERVAL '${periodDays} days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);

    res.json({
      overview: generalStats.rows[0],
      actions_by_type: actionsByType.rows,
      entities_by_activity: entitiesByActivity.rows,
      active_admins: activeAdmins.rows,
      activity_trend: activityTrend.rows,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques d'audit:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ======================================================================
// GESTION DES CATÉGORIES DE TOURS
// ======================================================================

// Récupérer toutes les catégories de tours
exports.getAllTourCategories = async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT 
        tc.*,
        COUNT(tca.tour_id) as tour_count
      FROM tour_categories tc
      LEFT JOIN tour_category_assignments tca ON tc.id = tca.category_id
      GROUP BY tc.id
      ORDER BY tc.display_order ASC, tc.name ASC
    `);

    res.status(200).json(categories.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Créer une nouvelle catégorie de tour
exports.createTourCategory = async (req, res) => {
  const { name, slug, description, icon, color, display_order, is_active } =
    req.body;

  if (!name || !slug) {
    return res.status(400).json({ error: "Le nom et le slug sont requis" });
  }

  try {
    // Vérifier si le slug existe déjà
    const existingCategory = await db.query(
      "SELECT id FROM tour_categories WHERE slug = $1",
      [slug]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(400).json({ error: "Ce slug existe déjà" });
    }

    const newCategory = await db.query(
      `INSERT INTO tour_categories 
       (name, slug, description, icon, color, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        name,
        slug,
        description,
        icon,
        color,
        display_order || 0,
        is_active !== false,
      ]
    );

    // Log de l'action admin
    await logAdminAction(
      req.user.id,
      "CREATE",
      "tour_category",
      newCategory.rows[0].id,
      { name, slug }
    );

    res.status(201).json(newCategory.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Mettre à jour une catégorie de tour
exports.updateTourCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, icon, color, display_order, is_active } =
    req.body;

  if (!name || !slug) {
    return res.status(400).json({ error: "Le nom et le slug sont requis" });
  }

  try {
    // Vérifier si la catégorie existe
    const existingCategory = await db.query(
      "SELECT * FROM tour_categories WHERE id = $1",
      [id]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }

    // Vérifier si le slug existe déjà pour une autre catégorie
    const slugCheck = await db.query(
      "SELECT id FROM tour_categories WHERE slug = $1 AND id != $2",
      [slug, id]
    );

    if (slugCheck.rows.length > 0) {
      return res.status(400).json({ error: "Ce slug existe déjà" });
    }

    const updatedCategory = await db.query(
      `UPDATE tour_categories 
       SET name = $1, slug = $2, description = $3, icon = $4, color = $5, 
           display_order = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, slug, description, icon, color, display_order, is_active, id]
    );

    // Log de l'action admin
    await logAdminAction(req.user.id, "UPDATE", "tour_category", id, {
      name,
      slug,
      changes: req.body,
    });

    res.status(200).json(updatedCategory.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Supprimer une catégorie de tour
exports.deleteTourCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si la catégorie existe
    const existingCategory = await db.query(
      "SELECT * FROM tour_categories WHERE id = $1",
      [id]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }

    // Vérifier si des tours utilisent cette catégorie
    const toursUsingCategory = await db.query(
      "SELECT COUNT(*) FROM tour_category_assignments WHERE category_id = $1",
      [id]
    );

    if (parseInt(toursUsingCategory.rows[0].count) > 0) {
      return res.status(400).json({
        error:
          "Impossible de supprimer cette catégorie car elle est utilisée par des tours",
      });
    }

    await db.query("DELETE FROM tour_categories WHERE id = $1", [id]);

    // Log de l'action admin
    await logAdminAction(req.user.id, "DELETE", "tour_category", id, {
      name: existingCategory.rows[0].name,
    });

    res.status(200).json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Activer/désactiver une catégorie de tour
exports.toggleTourCategoryStatus = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si la catégorie existe
    const existingCategory = await db.query(
      "SELECT * FROM tour_categories WHERE id = $1",
      [id]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }

    const newStatus = !existingCategory.rows[0].is_active;

    const updatedCategory = await db.query(
      "UPDATE tour_categories SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [newStatus, id]
    );

    // Log de l'action admin
    await logAdminAction(req.user.id, "UPDATE", "tour_category", id, {
      name: existingCategory.rows[0].name,
      status_change: `${existingCategory.rows[0].is_active} -> ${newStatus}`,
    });

    res.status(200).json(updatedCategory.rows[0]);
  } catch (error) {
    console.error(
      "Erreur lors du changement de statut de la catégorie:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ======================================================================
// SEND QUOTE TO CUSTOMER
// ======================================================================

/**
 * Send quote to customer with PDF generation
 * @route POST /api/admin/bookings/:bookingId/send-quote
 * @access Private/Admin
 */
exports.sendQuoteToCustomer = async (req, res) => {
  const { bookingId } = req.params;
  const { finalPrice } = req.body;

  try {
    // Import services
    const quoteEmailService = require("../services/quoteEmailService");
    const notificationService = require("../services/notificationService");

    // Get booking details with all related data
    const bookingQuery = await db.query(
      `
      SELECT
        b.*,
        u.email as user_email,
        u.id as user_id,
        u.full_name as contact_name,
        t.name as tour_name,
        pt.tier_name,
        pt.price as tier_price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN tours t ON b.tour_id = t.id
      JOIN packagetiers pt ON b.tier_id = pt.id
      WHERE b.id = $1
    `,
      [bookingId]
    );

    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookingQuery.rows[0];

    // Calculate quote expiration (48 hours)
    const quoteExpirationDate = new Date();
    quoteExpirationDate.setHours(quoteExpirationDate.getHours() + 48);

    // Update booking with final price and quote status
    await db.query(
      `
      UPDATE bookings
      SET
        final_price = $1,
        quote_sent_date = NOW(),
        quote_expiration_date = $2,
        quote_status = 'sent',
        status = 'Quote Sent'
      WHERE id = $3
    `,
      [finalPrice, quoteExpirationDate, bookingId]
    );

    // Prepare booking data for email
    const bookingData = {
      ...booking,
      booking_id: bookingId,
      contact_name: booking.contact_name,
      contact_email: booking.user_email,
      final_price: finalPrice,
    };

    // Send email with links to web pages
    await quoteEmailService.sendQuoteEmail(bookingData, finalPrice);

    // Create notification for user
    await notificationService.createQuoteReceivedNotification(
      booking,
      null // No PDF paths anymore
    );

    // Log admin action
    await logAdminAction(
      req.user.id,
      "SEND_QUOTE",
      "Booking",
      bookingId,
      {
        booking_reference: booking.booking_reference,
        final_price: finalPrice,
        quote_expiration: quoteExpirationDate,
      },
      req.ip || req.connection.remoteAddress,
      req.get("User-Agent")
    );

    res.status(200).json({
      success: true,
      message: "Quote sent successfully to customer",
      quote_sent_date: new Date(),
      quote_expiration_date: quoteExpirationDate,
      pdfs: {
        detailed: pdfPaths.detailed.relativePath,
        general: pdfPaths.general.relativePath,
      },
    });
  } catch (error) {
    console.error(`Error sending quote for booking #${bookingId}:`, error);
    res.status(500).json({
      error: "Failed to send quote",
      details: error.message,
    });
  }
};
