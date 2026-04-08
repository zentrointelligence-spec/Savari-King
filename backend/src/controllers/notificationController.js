const db = require("../db");

// Get user notifications
const getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT id, user_id, booking_id, type, title, message, channel, priority,
              is_read, sent_at, metadata
       FROM Notifications
       WHERE user_id = $1
       ORDER BY sent_at DESC`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark single notification as read
const markNotificationAsRead = async (req, res) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  try {
    const result = await db.query(
      `UPDATE Notifications 
       SET is_read = true, opened_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Notification not found or you are not authorized.",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `UPDATE Notifications 
       SET is_read = true, opened_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND is_read = false
       RETURNING id`,
      [userId]
    );

    res.status(200).json({
      message: "All notifications marked as read",
      updated_count: result.rowCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete single notification
const deleteNotification = async (req, res) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM Notifications WHERE id = $1 AND user_id = $2 RETURNING id",
      [notificationId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Notification not found or you are not authorized.",
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
      deleted_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete all notifications for user
const deleteAllNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      "DELETE FROM Notifications WHERE user_id = $1 RETURNING id",
      [userId]
    );

    res.status(200).json({
      message: "All notifications deleted successfully",
      deleted_count: result.rowCount,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get notification count (unread)
const getNotificationCount = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT 
         COUNT(*) as total_count,
         COUNT(*) FILTER (WHERE is_read = false) as unread_count,
         COUNT(*) FILTER (WHERE priority = 'high') as high_priority_count,
         COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count
       FROM Notifications 
       WHERE user_id = $1`,
      [userId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error getting notification count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create notification (for internal use)
const createNotification = async (userId, notificationData) => {
  const {
    booking_id = null,
    type,
    title,
    message,
    channel = "in_app",
    priority = "medium",
    template_id = null,
    metadata = null,
  } = notificationData;

  try {
    const result = await db.query(
      `INSERT INTO Notifications 
       (user_id, booking_id, type, title, message, channel, priority, template_id, metadata, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'sent')
       RETURNING *`,
      [
        userId,
        booking_id,
        type,
        title,
        message,
        channel,
        priority,
        template_id,
        metadata,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationCount,
  createNotification,
};
