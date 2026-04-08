// This will contain everything about notifications
const db = require("../db");

const sendInquiryConfirmationEmailToUserNotification = async (
  userId,
  bookingDetailsId
) => {
  try {
    await db.query(
      `INSERT INTO Notifications (user_id, booking_id, type, channel, status)
           VALUES ($1, $2, 'inquiry_received', 'email', 'sent')`,
      [userId, bookingDetailsId]
    );
  } catch (error) {
    console.error("Failed to log user notification:", error);
  }
};

const sendQuoteEmailToUserNotification = async (userId, bookingDetailsId) => {
  try {
    await db.query(
      `INSERT INTO Notifications (user_id, booking_id, type, channel, status)
           VALUES ($1, $2, 'quote_sent', 'email', 'sent')`,
      [userId, bookingDetailsId]
    );
  } catch (error) {
    console.error("Failed to log quote notification:", error);
  }
};

const sendPasswordResetEmailNotification = async (userId) => {
  try {
    await db.query(
      `INSERT INTO Notifications (user_id, type, channel, status) VALUES ($1, 'reset_password_sent', 'email', 'sent')`,
      [userId]
    );
  } catch (error) {
    console.error("Failed to log reset passord email notification:", error);
  }
};

const sendVerificationEmailNotification = async (userId) => {
  try {
    await db.query(
      `INSERT INTO Notifications (user_id, type, channel, status)
           VALUES ($1, 'user_verification', 'email', 'sent')`,
      [userId]
    );
  } catch (error) {
    console.error("Failed to log verification notification:", error);
  }
};

const sendRegisterAccountDoneEmailNotification = async (userId) => {
  try {
    await db.query(
      `INSERT INTO Notifications (user_id, type, channel, status)
             VALUES ($1, 'account_registered', 'email', 'done')`,
      [userId]
    );
  } catch (error) {
    console.error("Failed to log account registration notification:", error);
  }
};

const sendCancellationEmailToUserNotification = async (
  userId,
  bookingDetailsId
) => {
  try {
    await db.query(
      `INSERT INTO Notifications (user_id, booking_id, type, channel, status)
           VALUES ($1, $2, 'booking_cancelled', 'email', 'cancelled')`,
      [userId, bookingDetailsId]
    );
  } catch (error) {
    console.error("Failed to log cancelled booking notification:", error);
  }
};

const sendPasswordResetEmailDoneNotification = async (userId) => {
  try {
    await db.query(
      `INSERT INTO Notifications (user_id, type, channel, status)
           VALUES ($1, 'password_reset_success', 'email', 'created')`,
      [userId]
    );
  } catch (error) {
    console.error("Failed to log password reset notification:", error);
  }
};

module.exports = {
  sendInquiryConfirmationEmailToUserNotification,
  sendQuoteEmailToUserNotification,
  sendPasswordResetEmailNotification,
  sendVerificationEmailNotification,
  sendCancellationEmailToUserNotification,
  sendPasswordResetEmailDoneNotification,
  sendRegisterAccountDoneEmailNotification,
};
