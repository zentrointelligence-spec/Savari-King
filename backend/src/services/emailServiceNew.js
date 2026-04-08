/**
 * Enhanced Email Service for Booking System
 * Sends HTML emails using Nodemailer with template rendering
 */

const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");
const config = require("../config/config");
const notification = require("./sendNotifications");

// Create email transporter
const createTransporter = () => {
  if (!config.email.host || !config.email.user) {
    console.warn("⚠️  Email configuration not found. Emails will be logged but not sent.");
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

// Load and render email template
const loadTemplate = async (templateName, variables) => {
  try {
    const templatePath = path.join(__dirname, "../templates/emails", `${templateName}.html`);
    let template = await fs.readFile(templatePath, "utf8");

    // Simple template variable replacement
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      template = template.replace(regex, variables[key] || "");
    });

    // Handle conditional blocks (simple implementation)
    // {{#if variable}}...{{/if}}
    template = template.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, varName, content) => {
      return variables[varName] ? content : "";
    });

    // Handle each loops (simple implementation)
    // {{#each array}}...{{/each}}
    template = template.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, content) => {
      const array = variables[arrayName];
      if (!Array.isArray(array) || array.length === 0) return "";

      return array
        .map((item) => {
          let itemContent = content;
          Object.keys(item).forEach((key) => {
            const regex = new RegExp(`{{this\\.${key}}}`, "g");
            itemContent = itemContent.replace(regex, item[key] || "");
          });
          return itemContent;
        })
        .join("");
    });

    return template;
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    throw error;
  }
};

// Send email helper
const sendEmail = async (to, subject, htmlContent) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("📧 [EMAIL SIMULATION]", { to, subject });
    console.log("HTML content length:", htmlContent.length);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Ebenezer Tours" <${config.email.user}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

// Default variables for all emails
const getCommonVariables = () => ({
  current_year: new Date().getFullYear(),
  frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
  website_url: process.env.WEBSITE_URL || "http://localhost:3000",
  support_email: process.env.SUPPORT_EMAIL || "support@ebenezertours.com",
  support_phone: process.env.SUPPORT_PHONE || "+91 9876543210",
  facebook_url: "https://facebook.com/ebenezertours",
  instagram_url: "https://instagram.com/ebenezertours",
  terms_url: process.env.FRONTEND_URL + "/terms" || "http://localhost:3000/terms",
  admin_panel_url: process.env.ADMIN_URL || "http://localhost:3000/admin",
});

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format timestamp for display
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==================== BOOKING EMAIL FUNCTIONS ====================

/**
 * Send inquiry confirmation email to customer
 */
const sendInquiryConfirmationEmailToUser = async (bookingData) => {
  try {
    const variables = {
      ...getCommonVariables(),
      contact_name: bookingData.contact_name,
      booking_reference: bookingData.booking_reference,
      tour_name: bookingData.tour_name,
      tier_name: bookingData.tier_name,
      travel_date: formatDate(bookingData.travel_date),
      num_adults: bookingData.num_adults,
      num_children: bookingData.num_children || 0,
      estimated_price: Number(bookingData.estimated_price).toLocaleString("en-IN"),
    };

    const htmlContent = await loadTemplate("inquiry_received", variables);
    await sendEmail(
      bookingData.contact_email,
      `Booking Inquiry Received - ${bookingData.booking_reference}`,
      htmlContent
    );

    // Log notification in database
    if (bookingData.user_id) {
      await notification.sendInquiryConfirmationEmailToUserNotification(
        bookingData.user_id,
        bookingData.id
      );
    }

    console.log(`✅ Inquiry confirmation email sent to ${bookingData.contact_email}`);
  } catch (error) {
    console.error("Error sending inquiry confirmation email:", error);
    throw error;
  }
};

/**
 * Send new inquiry alert email to admin
 */
const sendNewInquiryEmailToAdmin = async (bookingData) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@ebenezertours.com";

    const variables = {
      ...getCommonVariables(),
      booking_reference: bookingData.booking_reference,
      tour_name: bookingData.tour_name,
      tier_name: bookingData.tier_name,
      travel_date: formatDate(bookingData.travel_date),
      num_adults: bookingData.num_adults,
      num_children: bookingData.num_children || 0,
      estimated_price: Number(bookingData.estimated_price).toLocaleString("en-IN"),
      contact_name: bookingData.contact_name,
      contact_email: bookingData.contact_email,
      contact_phone: bookingData.contact_phone,
      user_id: bookingData.user_id,
      special_requests: bookingData.special_requests,
      selected_addons: bookingData.selected_addons || [],
      selected_vehicles: bookingData.selected_vehicles || [],
      booking_id: bookingData.id,
      inquiry_timestamp: formatTimestamp(bookingData.inquiry_date || new Date()),
    };

    const htmlContent = await loadTemplate("new_inquiry_admin", variables);
    await sendEmail(
      adminEmail,
      `🔔 New Booking Inquiry - ${bookingData.booking_reference}`,
      htmlContent
    );

    console.log(`✅ Admin alert email sent for booking ${bookingData.booking_reference}`);
  } catch (error) {
    console.error("Error sending admin alert email:", error);
    throw error;
  }
};

/**
 * Send quote ready email to customer
 */
const sendQuoteEmailToUser = async (bookingData) => {
  try {
    const variables = {
      ...getCommonVariables(),
      contact_name: bookingData.contact_name,
      booking_reference: bookingData.booking_reference,
      tour_name: bookingData.tour_name,
      tier_name: bookingData.tier_name,
      travel_date: formatDate(bookingData.travel_date),
      num_adults: bookingData.num_adults,
      num_children: bookingData.num_children || 0,
      final_price: Number(bookingData.final_price).toLocaleString("en-IN"),
      base_price: Number(bookingData.tier_price || bookingData.final_price).toLocaleString("en-IN"),
      quote_expiration_date: formatTimestamp(bookingData.quote_expiration_date),
      admin_notes: bookingData.admin_notes,
      selected_addons: bookingData.selected_addons || [],
      selected_vehicles: bookingData.selected_vehicles || [],
      payment_url: `${getCommonVariables().frontend_url}/bookings/${bookingData.id}/payment`,
    };

    const htmlContent = await loadTemplate("quote_ready", variables);
    await sendEmail(
      bookingData.contact_email,
      `Your Custom Quote is Ready - ${bookingData.booking_reference}`,
      htmlContent
    );

    // Log notification in database
    if (bookingData.user_id) {
      await notification.sendQuoteEmailToUserNotification(bookingData.user_id, bookingData.id);
    }

    console.log(`✅ Quote email sent to ${bookingData.contact_email}`);
  } catch (error) {
    console.error("Error sending quote email:", error);
    throw error;
  }
};

/**
 * Send payment confirmation email to customer
 */
const sendPaymentConfirmationEmailToUser = async (bookingData) => {
  try {
    // Calculate hours remaining for cancellation
    const paymentTime = new Date(bookingData.payment_timestamp);
    const expiryTime = new Date(paymentTime.getTime() + 24 * 60 * 60 * 1000);
    const hoursRemaining = Math.max(0, Math.floor((expiryTime - new Date()) / (1000 * 60 * 60)));

    const variables = {
      ...getCommonVariables(),
      contact_name: bookingData.contact_name,
      booking_reference: bookingData.booking_reference,
      tour_name: bookingData.tour_name,
      tier_name: bookingData.tier_name,
      travel_date: formatDate(bookingData.travel_date),
      num_adults: bookingData.num_adults,
      num_children: bookingData.num_children || 0,
      final_price: Number(bookingData.final_price).toLocaleString("en-IN"),
      payment_timestamp: formatTimestamp(bookingData.payment_timestamp),
      cancellation_hours_remaining: hoursRemaining,
      booking_id: bookingData.id,
      download_pdf_url: `${getCommonVariables().frontend_url}/bookings/${
        bookingData.id
      }/download-pdf`,
    };

    const htmlContent = await loadTemplate("payment_confirmed", variables);
    await sendEmail(
      bookingData.contact_email,
      `Payment Confirmed - ${bookingData.booking_reference}`,
      htmlContent
    );

    console.log(`✅ Payment confirmation email sent to ${bookingData.contact_email}`);
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    throw error;
  }
};

/**
 * Send payment alert email to admin
 */
const sendPaymentAlertEmailToAdmin = async (bookingData) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@ebenezertours.com";

    // Calculate days until travel
    const travelDate = new Date(bookingData.travel_date);
    const today = new Date();
    const daysUntilTravel = Math.ceil((travelDate - today) / (1000 * 60 * 60 * 24));

    // Calculate time between quote and payment
    const quoteSent = new Date(bookingData.quote_sent_date);
    const paymentReceived = new Date(bookingData.payment_timestamp);
    const hoursToPayment = Math.floor((paymentReceived - quoteSent) / (1000 * 60 * 60));
    const timeToPayment = `${hoursToPayment} hours`;

    const variables = {
      ...getCommonVariables(),
      booking_reference: bookingData.booking_reference,
      tour_name: bookingData.tour_name,
      tier_name: bookingData.tier_name,
      travel_date: formatDate(bookingData.travel_date),
      num_adults: bookingData.num_adults,
      num_children: bookingData.num_children || 0,
      final_price: Number(bookingData.final_price).toLocaleString("en-IN"),
      contact_name: bookingData.contact_name,
      contact_email: bookingData.contact_email,
      contact_phone: bookingData.contact_phone,
      user_id: bookingData.user_id,
      special_requests: bookingData.special_requests,
      booking_id: bookingData.id,
      payment_timestamp: formatTimestamp(bookingData.payment_timestamp),
      quote_sent_date: formatTimestamp(bookingData.quote_sent_date),
      time_to_payment: timeToPayment,
      days_until_travel: daysUntilTravel,
    };

    const htmlContent = await loadTemplate("payment_alert_admin", variables);
    await sendEmail(
      adminEmail,
      `💰 Payment Received - ${bookingData.booking_reference}`,
      htmlContent
    );

    console.log(`✅ Admin payment alert sent for booking ${bookingData.booking_reference}`);
  } catch (error) {
    console.error("Error sending admin payment alert:", error);
    throw error;
  }
};

/**
 * Send cancellation confirmation email to customer
 */
const sendCancellationEmailToUser = async (bookingData) => {
  try {
    const variables = {
      ...getCommonVariables(),
      contact_name: bookingData.contact_name,
      booking_reference: bookingData.booking_reference,
      tour_name: bookingData.tour_name,
      tier_name: bookingData.tier_name,
      travel_date: formatDate(bookingData.travel_date),
      final_price: Number(bookingData.final_price || bookingData.estimated_price).toLocaleString(
        "en-IN"
      ),
      cancellation_date: formatTimestamp(bookingData.cancellation_date || new Date()),
      refund_eligible: bookingData.refund_eligible || false,
      refund_amount: bookingData.refund_amount
        ? Number(bookingData.refund_amount).toLocaleString("en-IN")
        : "0",
      feedback_url: `${getCommonVariables().frontend_url}/feedback`,
    };

    const htmlContent = await loadTemplate("cancellation_confirmed", variables);
    await sendEmail(
      bookingData.contact_email,
      `Booking Cancellation Confirmed - ${bookingData.booking_reference}`,
      htmlContent
    );

    // Log notification in database
    if (bookingData.user_id) {
      await notification.sendCancellationEmailToUserNotification(
        bookingData.user_id,
        bookingData.id
      );
    }

    console.log(`✅ Cancellation email sent to ${bookingData.contact_email}`);
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    throw error;
  }
};

/**
 * Send trip review request email to customer
 */
const sendTripReviewRequestEmail = async (bookingData) => {
  try {
    const variables = {
      ...getCommonVariables(),
      contact_name: bookingData.contact_name,
      booking_reference: bookingData.booking_reference,
      tour_name: bookingData.tour_name,
      tier_name: bookingData.tier_name,
      travel_date: formatDate(bookingData.travel_date),
      review_url: `${getCommonVariables().frontend_url}/bookings/${bookingData.id}/review`,
    };

    const htmlContent = await loadTemplate("trip_review_request", variables);
    await sendEmail(
      bookingData.contact_email,
      `How Was Your Trip? Share Your Experience 🌟`,
      htmlContent
    );

    console.log(`✅ Review request email sent to ${bookingData.contact_email}`);
  } catch (error) {
    console.error("Error sending review request email:", error);
    throw error;
  }
};

// ==================== LEGACY FUNCTIONS (Preserved for compatibility) ====================

const sendPasswordResetEmail = async (userId) => {
  // Email logic to be implemented
  await notification.sendPasswordResetEmailNotification(userId);
};

const sendPasswordResetEmailDone = async (userId) => {
  await notification.sendPasswordResetEmailDoneNotification(userId);
};

const sendVerificationEmail = async (userId) => {
  // Email logic to be implemented
  await notification.sendVerificationEmailNotification(userId);
};

const sendRegisterAccountDoneEmail = async (userId) => {
  // Email logic to be implemented
  await notification.sendRegisterAccountDoneEmailNotification(userId);
};

module.exports = {
  // New booking email functions
  sendInquiryConfirmationEmailToUser,
  sendNewInquiryEmailToAdmin,
  sendQuoteEmailToUser,
  sendPaymentConfirmationEmailToUser,
  sendPaymentAlertEmailToAdmin,
  sendCancellationEmailToUser,
  sendTripReviewRequestEmail,

  // Legacy functions (preserved for compatibility)
  sendPasswordResetEmail,
  sendPasswordResetEmailDone,
  sendVerificationEmail,
  sendRegisterAccountDoneEmail,

  // Utility functions
  loadTemplate,
  sendEmail,
};
