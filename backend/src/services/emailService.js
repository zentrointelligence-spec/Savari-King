const notification = require("./sendNotifications");

const sendInquiryConfirmationEmailToUser = async (userId, bookingDetailsId) => {
  // Email logic

  // Log the notification in the database
  await notification.sendInquiryConfirmationEmailToUserNotification(
    userId,
    bookingDetailsId
  );
};

// --- NEW FUNCTION: Send the quote email to the user ---
const sendQuoteEmailToUser = async (userId, bookingDetailsId) => {
  // Email logic

  // Log the notification in the database
  await notification.sendQuoteEmailToUserNotification(userId, bookingDetailsId);
};

// Send the password reset email ---
const sendPasswordResetEmail = async (userId) => {
  // Email logic

  await notification.sendPasswordResetEmailNotification(userId);
};

// Send the password reset email done
const sendPasswordResetEmailDone = async (userId) => {
  await notification.sendPasswordResetEmailDoneNotification(userId);
};

// --- Verification Email Function (restored) ---
const sendVerificationEmail = async (userId) => {
  // Logic for email sending
  // To write here...

  // Log the notification in the database
  await notification.sendVerificationEmailNotification(userId);
};

// FUNCTIONS for CANCELLATION
const sendCancellationEmailToUser = async (userId, bookingDetailsId) => {
  // Email logic

  // Log the notification in the database
  await notification.sendCancellationEmailToUserNotification(
    userId,
    bookingDetailsId
  );
};

//
const sendRegisterAccountDoneEmail = async (userId) => {
  // Email Logic

  // Log to the notification in the database
  await notification.sendRegisterAccountDoneEmailNotification(userId);
};

const sendNewInquiryEmailToAdmin = async () => {
  // Email logic
};

module.exports = {
  sendInquiryConfirmationEmailToUser,
  sendQuoteEmailToUser,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendCancellationEmailToUser,
  sendPasswordResetEmailDone,
  sendNewInquiryEmailToAdmin,
  sendRegisterAccountDoneEmail,
};
