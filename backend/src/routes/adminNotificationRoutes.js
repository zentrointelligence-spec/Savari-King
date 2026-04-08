const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { query } = require('../db/index');

// Get all notifications with filters and stats
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const {
      type = 'all',
      status = 'all',
      priority = 'all',
      dateRange = '7d',
      page = 1,
      limit = 50
    } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Apply filters
    if (type !== 'all') {
      whereConditions.push(`n.type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (status !== 'all') {
      whereConditions.push(`n.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (priority !== 'all') {
      whereConditions.push(`n.priority = $${paramIndex}`);
      queryParams.push(priority);
      paramIndex++;
    }

    // Date range filter
    if (dateRange !== 'all') {
      const days = parseInt(dateRange.replace('d', ''));
      whereConditions.push(`n.created_at >= NOW() - INTERVAL '${days} days'`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get notifications with user info
    const offset = (page - 1) * limit;
    const notificationsQuery = `
      SELECT 
        n.*,
        u.email as user_email,
        u.first_name,
        u.last_name
      FROM Notifications n
      LEFT JOIN Users u ON n.user_id = u.id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const notificationsResult = await query(notificationsQuery, queryParams);

    // Get stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread
      FROM Notifications n
      ${whereClause}
    `;

    const statsResult = await query(statsQuery, queryParams.slice(0, -2)); // Remove limit and offset
    const stats = statsResult.rows[0];

    // Convert counts to numbers
    Object.keys(stats).forEach(key => {
      stats[key] = parseInt(stats[key]) || 0;
    });

    res.json({
      success: true,
      data: {
        notifications: notificationsResult.rows,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: stats.total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications'
    });
  }
});

// Create new notification
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const {
      user_id,
      type,
      title,
      message,
      priority = 'medium',
      send_email = false,
      schedule_at = null
    } = req.body;

    // Validate required fields
    if (!user_id || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants: user_id, type, title, message'
      });
    }

    // Check if user exists
    const userCheck = await query('SELECT id FROM Users WHERE id = $1', [user_id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const status = schedule_at ? 'scheduled' : 'pending';
    const sent_at = schedule_at || new Date();

    const insertQuery = `
      INSERT INTO Notifications (
        user_id, type, title, message, priority, status, 
        is_read, sent_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(insertQuery, [
      user_id, type, title, message, priority, status, false, sent_at
    ]);

    const notification = result.rows[0];

    // If send_email is true and not scheduled, send email immediately
    if (send_email && !schedule_at) {
      // TODO: Implement email sending logic
      console.log('Email sending would be triggered here for notification:', notification.id);
    }

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification créée avec succès'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la notification'
    });
  }
});

// Update notification
router.patch('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = ['title', 'message', 'priority', 'status', 'type'];
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(field => {
      if (allowedFields.includes(field)) {
        updateFields.push(`${field} = $${paramIndex}`);
        queryParams.push(updates[field]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ valide à mettre à jour'
      });
    }

    updateFields.push(`updated_at = NOW()`);
    queryParams.push(id);

    const updateQuery = `
      UPDATE Notifications 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Notification mise à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la notification'
    });
  }
});

// Delete notification
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM Notifications WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Notification supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la notification'
    });
  }
});

// Resend notification
router.post('/:id/resend', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get notification details
    const notificationResult = await query(
      'SELECT * FROM Notifications WHERE id = $1',
      [id]
    );

    if (notificationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    const notification = notificationResult.rows[0];

    // Update status to pending and reset sent_at
    await query(
      'UPDATE Notifications SET status = $1, sent_at = NOW(), updated_at = NOW() WHERE id = $2',
      ['pending', id]
    );

    // TODO: Implement actual email resending logic
    console.log('Email resending would be triggered here for notification:', id);

    res.json({
      success: true,
      message: 'Notification programmée pour renvoi'
    });
  } catch (error) {
    console.error('Error resending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du renvoi de la notification'
    });
  }
});

module.exports = router;