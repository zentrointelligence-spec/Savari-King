const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/tokenUtils");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetEmailDone,
  sendRegisterAccountDoneEmail,
} = require("../services/emailService");
const { logUserActivity } = require("../services/activityService");

// --- Register ---
exports.register = async (req, res) => {
  const { full_name, email, password, phone, country } = req.body;

  if (!full_name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }

  try {
    const userExists = await db.query("SELECT * FROM Users WHERE email = $1", [
      email,
    ]);
    if (userExists.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = generateToken();

    const newUser = await db.query(
      `INSERT INTO Users (full_name, email, password, verification_token, phone, country)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email`,
      [full_name, email, hashedPassword, verificationToken, phone, country]
    );

    const newUserId = newUser.rows[0].id;
    await logUserActivity(newUserId, "Account Created");
    sendRegisterAccountDoneEmail(newUserId);

    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Request a password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const userResult = await db.query("SELECT * FROM Users WHERE email = $1", [
      email,
    ]);
    if (userResult.rows.length === 0) {
      // For security, we don't reveal whether the email exists or not.
      return res.status(200).json({
        message:
          "If an account with this email exists, a reset request has been sent to the administrator.",
      });
    }
    const user = userResult.rows[0];

    // We create a reset request with 'pending' status.
    await db.query(
      "INSERT INTO PasswordResets (user_id, email, status) VALUES ($1, $2, $3)",
      [user.id, user.email, "pending"]
    );

    // We could notify the admin here.
    sendPasswordResetEmail(user.id);

    res.status(200).json({
      message:
        "If an account with this email exists, a reset request has been sent to the administrator.",
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Reset the password with a valid token ---
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required." });
  }

  try {
    const resetRequest = await db.query(
      "SELECT * FROM PasswordResets WHERE reset_token = $1 AND status = $2 AND expires_at > NOW()",
      [token, "approved"]
    );

    if (resetRequest.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or expired password reset token." });
    }

    const { user_id } = resetRequest.rows[0];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await db.query("UPDATE Users SET password = $1 WHERE id = $2", [
      hashedPassword,
      user_id,
    ]);

    // Mark the token as used so it cannot be reused
    await db.query(
      "UPDATE PasswordResets SET status = $1 WHERE reset_token = $2",
      ["used", token]
    );

    // Log the successful password reset notification
    sendPasswordResetEmailDone(user_id);

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Email Verification ---
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is missing." });
  }

  try {
    const userResult = await db.query(
      "SELECT * FROM Users WHERE verification_token = $1",
      [token]
    );

    if (userResult.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification token." });
    }

    const userId = userResult.rows[0].id;

    // Update the user to mark them as verified and remove the token.
    await db.query(
      "UPDATE Users SET is_verified = true, verification_token = NULL WHERE id = $1",
      [userId]
    );

    await logUserActivity(userId, "Email Verified");
    // Log the account verification notification in the database
    sendVerificationEmail(userId);

    res
      .status(200)
      .json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.error("Error during email verification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Login ---
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const userResult = await db.query("SELECT * FROM Users WHERE email = $1", [
      email,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // CRUCIAL CHECK: The user must have verified their email.
    if (!user.is_verified) {
      return res.status(403).json({
        error:
          "Login failed. Please verify your email address before logging in.",
      });
    }

    // Update last_login timestamp
    await db.query(
      "UPDATE users SET last_login = NOW() WHERE id = $1",
      [user.id]
    );

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    await logUserActivity(user.id, "Logged In");

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  // L'ID de l'utilisateur est fourni par le middleware 'protect'.
  const userId = req.user.id;
  try {
    // Récupérer les informations de base de l'utilisateur
    const result = await db.query(
      "SELECT id, full_name, email, phone, country, creation_date, recent_activities, activity_count, is_verified FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = result.rows[0];

    // Récupérer les statistiques utilisateur
    const bookingStats = await db.query(`
      SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'Payment Confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'Trip Completed' THEN 1 END) as completed_bookings,
        COALESCE(SUM(CASE WHEN status IN ('Payment Confirmed', 'Trip Completed') THEN final_price ELSE 0 END), 0) as total_spent
      FROM bookings
      WHERE user_id = $1
    `, [userId]);

    // Récupérer le nombre de favoris
    const favoritesCount = await db.query(
      'SELECT COUNT(*) as favorites_count FROM user_favorites uf JOIN tours t ON uf.tour_id = t.id WHERE uf.user_id = $1 AND t.is_active = TRUE',
      [userId]
    );

    // Récupérer les notifications non lues
    const unreadNotifications = await db.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    // Récupérer les tours favoris récents (3 derniers)
    const recentFavorites = await db.query(`
      SELECT
        t.id,
        t.name as title,
        t.slug,
        t.main_image_url as main_image,
        t.original_price as base_price
      FROM user_favorites uf
      JOIN tours t ON uf.tour_id = t.id
      WHERE uf.user_id = $1 AND t.is_active = TRUE
      ORDER BY uf.created_at DESC
      LIMIT 3
    `, [userId]);

    res.status(200).json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      country: user.country,
      created_at: user.creation_date,
      is_verified: user.is_verified,
      statistics: {
        bookings: bookingStats.rows[0],
        favorites_count: favoritesCount.rows[0].favorites_count,
        unread_notifications: unreadNotifications.rows[0].unread_count
      },
      recent_favorites: recentFavorites.rows
    });
  } catch (error) {
    console.error('[getUserProfile] Error:', error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { full_name, phone, country } = req.body;
  try {
    const result = await db.query(
      "UPDATE users SET full_name = $1, phone = $2, country = $3 WHERE id = $4 RETURNING id, full_name, email, phone, country",
      [full_name, phone, country, userId]
    );
    await logUserActivity(userId, "Profile Updated");
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const userResult = await db.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );
    const user = userResult.rows[0];

    // Vérifier si le mot de passe actuel est correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe dans la base de données
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    await logUserActivity(userId, "Password Changed");
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      "SELECT * FROM Notifications WHERE user_id = $1 ORDER BY sent_at DESC",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  const userId = req.user.id;
  const { notificationId } = req.params;
  try {
    const result = await db.query(
      "UPDATE Notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *",
      [notificationId, userId]
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Notification not found or you are not authorized." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Ajouter un tour aux favoris
exports.addToFavorites = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user.id;

    // Vérifier si le tour existe
    const tourExists = await db.query(
      'SELECT id FROM tours WHERE id = $1 AND is_active = TRUE',
      [tourId]
    );

    if (tourExists.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Vérifier si déjà en favoris
    const existing = await db.query(
      'SELECT id FROM user_favorites WHERE user_id = $1 AND tour_id = $2',
      [userId, tourId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Tour already in favorites' });
    }

    // Ajouter aux favoris
    await db.query(
      'INSERT INTO user_favorites (user_id, tour_id) VALUES ($1, $2)',
      [userId, tourId]
    );

    res.status(201).json({ message: 'Tour added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Retirer un tour des favoris
exports.removeFromFavorites = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND tour_id = $2',
      [userId, tourId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tour not found in favorites' });
    }

    res.json({ message: 'Tour removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Récupérer les tours favoris de l'utilisateur
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Récupérer les favoris avec les détails des tours
    const favorites = await db.query(`
      SELECT 
        uf.id as favorite_id,
        uf.created_at as added_to_favorites_at,
        t.id,
        t.title,
        t.slug,
        t.description,
        t.duration,
        t.difficulty_level,
        t.main_image,
        t.gallery_images,
        t.themes,
        t.destinations,
        ts.base_price_inr,
        ts.total_views,
        ts.total_bookings,
        ts.average_rating,
        ts.review_count
      FROM user_favorites uf
      JOIN tours t ON uf.tour_id = t.id
      LEFT JOIN tour_statistics ts ON t.id = ts.tour_id
      WHERE uf.user_id = $1 AND t.is_active = TRUE
      ORDER BY uf.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Compter le total
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM user_favorites uf JOIN tours t ON uf.tour_id = t.id WHERE uf.user_id = $1 AND t.is_active = TRUE',
      [userId]
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      favorites: favorites.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error retrieving favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// WISHLIST MANAGEMENT (separate from favorites)
// ============================================================================

// Check if tour is in favorites
exports.checkFavorite = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT id FROM user_favorites WHERE user_id = $1 AND tour_id = $2',
      [userId, tourId]
    );

    res.json({ isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add tour to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user.id;
    const { notes, priority } = req.body;

    // Check if tour exists
    const tourExists = await db.query(
      'SELECT id FROM tours WHERE id = $1 AND is_active = TRUE',
      [tourId]
    );

    if (tourExists.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Check if already in wishlist
    const existing = await db.query(
      'SELECT id FROM user_wishlist WHERE user_id = $1 AND tour_id = $2',
      [userId, tourId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Tour already in wishlist' });
    }

    // Add to wishlist
    await db.query(
      'INSERT INTO user_wishlist (user_id, tour_id, notes, priority) VALUES ($1, $2, $3, $4)',
      [userId, tourId, notes || null, priority || 0]
    );

    res.status(201).json({ message: 'Tour added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove tour from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM user_wishlist WHERE user_id = $1 AND tour_id = $2',
      [userId, tourId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tour not found in wishlist' });
    }

    res.json({ message: 'Tour removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's wishlist
exports.getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get wishlist with tour details
    const wishlist = await db.query(`
      SELECT
        uw.id as wishlist_id,
        uw.notes,
        uw.priority,
        uw.created_at as added_to_wishlist_at,
        t.id,
        t.name,
        t.slug,
        t.short_description,
        t.main_image_url,
        t.gallery_images,
        t.themes,
        t.destinations,
        t.original_price,
        t.discount_percentage,
        (t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100)) as final_price,
        t.view_count,
        t.booking_count,
        t.avg_rating,
        t.review_count
      FROM user_wishlist uw
      JOIN tours t ON uw.tour_id = t.id
      WHERE uw.user_id = $1 AND t.is_active = TRUE
      ORDER BY uw.priority DESC, uw.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Count total
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM user_wishlist uw JOIN tours t ON uw.tour_id = t.id WHERE uw.user_id = $1 AND t.is_active = TRUE',
      [userId]
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      wishlist: wishlist.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error retrieving wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if tour is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT id, notes, priority FROM user_wishlist WHERE user_id = $1 AND tour_id = $2',
      [userId, tourId]
    );

    res.json({
      isInWishlist: result.rows.length > 0,
      details: result.rows.length > 0 ? result.rows[0] : null
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update wishlist item (notes or priority)
exports.updateWishlistItem = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user.id;
    const { notes, priority } = req.body;

    const result = await db.query(
      'UPDATE user_wishlist SET notes = $1, priority = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND tour_id = $4 RETURNING *',
      [notes, priority || 0, userId, tourId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tour not found in wishlist' });
    }

    res.json({
      message: 'Wishlist item updated',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating wishlist item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Récupérer l'activité de l'utilisateur
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Récupérer l'activité depuis la vue user_activity_log
    const activities = await db.query(`
      SELECT 
        activity_type,
        activity_description,
        tour_id,
        tour_title,
        booking_id,
        created_at
      FROM user_activity_log
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Compter le total
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM user_activity_log WHERE user_id = $1',
      [userId]
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      activities: activities.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error retrieving user activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user preferences
 * GET /api/users/preferences
 * @access Private
 */
exports.getUserPreferences = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT preference_key, preference_value, data_type
       FROM user_preferences
       WHERE user_id = $1`,
      [userId]
    );

    // Convert array of preferences to object
    const preferences = {};
    result.rows.forEach(row => {
      let value = row.preference_value;

      // Parse based on data type
      if (row.data_type === 'boolean') {
        value = value === 'true';
      } else if (row.data_type === 'number') {
        value = parseFloat(value);
      } else if (row.data_type === 'json') {
        value = JSON.parse(value);
      }

      preferences[row.preference_key] = value;
    });

    res.status(200).json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('[getUserPreferences] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Update user preferences
 * PUT /api/users/preferences
 * @access Private
 */
exports.updateUserPreferences = async (req, res) => {
  const userId = req.user.id;
  const { language, currency, emailNotifications, pushNotifications } = req.body;

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Helper function to upsert preference
    const upsertPreference = async (key, value, dataType = 'string') => {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

      await client.query(
        `INSERT INTO user_preferences (user_id, preference_key, preference_value, data_type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, preference_key)
         DO UPDATE SET
           preference_value = EXCLUDED.preference_value,
           data_type = EXCLUDED.data_type,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, key, stringValue, dataType]
      );
    };

    // Save language preference
    if (language) {
      await upsertPreference('language', language, 'string');
    }

    // Save currency preference
    if (currency) {
      await upsertPreference('currency', currency, 'string');
    }

    // Save email notifications
    if (emailNotifications) {
      await upsertPreference('emailNotifications', emailNotifications, 'json');
    }

    // Save push notifications
    if (pushNotifications) {
      await upsertPreference('pushNotifications', pushNotifications, 'json');
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[updateUserPreferences] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    client.release();
  }
};
