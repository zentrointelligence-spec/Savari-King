const express = require("express");
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// All notification routes require authentication
router.use(protect);

// GET /api/notifications - Get all user notifications
router.get("/", notificationController.getUserNotifications);

// GET /api/notifications/count - Get notification counts
router.get("/count", notificationController.getNotificationCount);

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
router.patch(
  "/mark-all-read",
  notificationController.markAllNotificationsAsRead
);

// DELETE /api/notifications - Delete all user notifications
router.delete("/", notificationController.deleteAllNotifications);

// PATCH /api/notifications/:notificationId/read - Mark single notification as read
router.patch(
  "/:notificationId/read",
  notificationController.markNotificationAsRead
);

// DELETE /api/notifications/:notificationId - Delete single notification
router.delete("/:notificationId", notificationController.deleteNotification);

module.exports = router;
