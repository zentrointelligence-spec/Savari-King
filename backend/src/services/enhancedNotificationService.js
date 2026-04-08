const { createNotification } = require("../controllers/notificationController");

// Enhanced notification service with proper titles and messages
class NotificationService {
  // Create booking inquiry notification
  static async createBookingInquiryNotification(userId, bookingId, tourName) {
    return await createNotification(userId, {
      booking_id: bookingId,
      type: "inquiry_received",
      title: "Booking Inquiry Received",
      message: `Thank you for your interest in "${tourName}"! We will contact you within 24 hours with a personalized quote.`,
      channel: "in_app",
      priority: "medium",
      metadata: { tour_name: tourName },
    });
  }

  // Create quote sent notification
  static async createQuoteSentNotification(userId, bookingId, tourName, price) {
    return await createNotification(userId, {
      booking_id: bookingId,
      type: "quote_sent",
      title: "Your Quote is Ready!",
      message: `Your personalized quote for "${tourName}" (₹${price.toLocaleString(
        "en-IN"
      )}) has been prepared. Please review and proceed to payment.`,
      channel: "in_app",
      priority: "high",
      metadata: { tour_name: tourName, price: price },
    });
  }

  // Create payment confirmation notification
  static async createPaymentConfirmedNotification(userId, bookingId, tourName) {
    return await createNotification(userId, {
      booking_id: bookingId,
      type: "payment_confirmed",
      title: "Payment Confirmed!",
      message: `Your payment for "${tourName}" has been successfully processed. Get ready for your adventure!`,
      channel: "in_app",
      priority: "high",
      metadata: { tour_name: tourName },
    });
  }

  // Create booking cancellation notification
  static async createBookingCancelledNotification(
    userId,
    bookingId,
    tourName,
    reason = null
  ) {
    return await createNotification(userId, {
      booking_id: bookingId,
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: `Your booking for "${tourName}" has been cancelled${
        reason ? `: ${reason}` : "."
      }`,
      channel: "in_app",
      priority: "medium",
      metadata: { tour_name: tourName, reason: reason },
    });
  }

  // Create password reset notification
  static async createPasswordResetNotification(userId) {
    return await createNotification(userId, {
      type: "reset_password_sent",
      title: "Password Reset Link Sent",
      message:
        "A password reset link has been sent to your email address. Please check your inbox and follow the instructions.",
      channel: "in_app",
      priority: "medium",
    });
  }

  // Create email verification notification
  static async createEmailVerificationNotification(userId) {
    return await createNotification(userId, {
      type: "user_verification",
      title: "Email Verified Successfully",
      message:
        "Your email has been verified successfully. You can now access all features of your account.",
      channel: "in_app",
      priority: "low",
    });
  }

  // Create account registration notification
  static async createAccountRegistrationNotification(userId, userName) {
    return await createNotification(userId, {
      type: "account_registered",
      title: "Welcome to Ebenezer Tours!",
      message: `Welcome ${userName}! Your account has been created successfully. Start exploring our amazing tour packages.`,
      channel: "in_app",
      priority: "medium",
      metadata: { user_name: userName },
    });
  }

  // Create password reset success notification
  static async createPasswordResetSuccessNotification(userId) {
    return await createNotification(userId, {
      type: "password_reset_success",
      title: "Password Reset Successful",
      message:
        "Your password has been reset successfully. You can now log in with your new password.",
      channel: "in_app",
      priority: "medium",
    });
  }

  // Create tour reminder notification
  static async createTourReminderNotification(
    userId,
    bookingId,
    tourName,
    travelDate
  ) {
    const daysUntilTravel = Math.ceil(
      (new Date(travelDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return await createNotification(userId, {
      booking_id: bookingId,
      type: "tour_reminder",
      title: "Tour Reminder",
      message: `Your "${tourName}" tour is coming up in ${daysUntilTravel} days! Make sure you have everything ready for your adventure.`,
      channel: "in_app",
      priority: "medium",
      metadata: {
        tour_name: tourName,
        travel_date: travelDate,
        days_until: daysUntilTravel,
      },
    });
  }

  // Create review request notification
  static async createReviewRequestNotification(userId, bookingId, tourName) {
    return await createNotification(userId, {
      booking_id: bookingId,
      type: "review_request",
      title: "How was your trip?",
      message: `We hope you enjoyed your "${tourName}" experience! Please take a moment to share your feedback and help other travelers.`,
      channel: "in_app",
      priority: "low",
      metadata: { tour_name: tourName },
    });
  }

  // Create promotional notification
  static async createPromotionalNotification(
    userId,
    title,
    message,
    metadata = null
  ) {
    return await createNotification(userId, {
      type: "promotional",
      title: title,
      message: message,
      channel: "in_app",
      priority: "low",
      metadata: metadata,
    });
  }

  // Create system notification
  static async createSystemNotification(
    userId,
    title,
    message,
    priority = "medium"
  ) {
    return await createNotification(userId, {
      type: "system",
      title: title,
      message: message,
      channel: "in_app",
      priority: priority,
    });
  }
}

module.exports = NotificationService;
