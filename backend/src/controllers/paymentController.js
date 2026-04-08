/**
 * Payment Controller
 * G�re les paiements simul�s (Card, Bank Transfer, PayPal)
 */

const db = require("../db");
const {
  sendPaymentConfirmedEmail,
  sendBookingConfirmedEmail,
} = require("../services/emailSimulationService");
const {
  logPaymentPending,
  logPaymentConfirmed,
  createToastNotification,
} = require("../services/adminNotificationService");
const notificationService = require("../services/notificationService");
const bookingPdfService = require("../services/bookingPdfService");

/**
 * @description Vérifie si le quote d'une réservation est valide et non expiré
 * @param {Object} client - Client de connexion PostgreSQL
 * @param {Number} bookingId - ID de la réservation
 * @param {Number} userId - ID de l'utilisateur
 * @returns {Object} { valid: boolean, booking: object, error: string }
 */
const checkQuoteExpiration = async (client, bookingId, userId) => {
  const result = await client.query(
    `SELECT
      id,
      user_id,
      status,
      quote_expiration_date,
      quote_status,
      final_price,
      booking_reference
    FROM bookings
    WHERE id = $1`,
    [bookingId]
  );

  if (result.rows.length === 0) {
    return { valid: false, error: "Booking not found" };
  }

  const booking = result.rows[0];

  // Vérifier que la réservation appartient à l'utilisateur
  if (booking.user_id !== userId) {
    return { valid: false, error: "Unauthorized access to this booking" };
  }

  // Vérifier si le paiement est déjà confirmé
  if (booking.status === "Payment Confirmed" || booking.status === "Trip Completed") {
    return {
      valid: false,
      error: "This booking has already been paid"
    };
  }

  // Vérifier si un quote existe
  if (!booking.quote_expiration_date) {
    return {
      valid: false,
      error: "No quote available for this booking. Please wait for the quote to be sent."
    };
  }

  // Vérifier si le quote a expiré
  const now = new Date();
  const expirationDate = new Date(booking.quote_expiration_date);

  if (expirationDate < now) {
    const hoursExpired = Math.floor((now - expirationDate) / (1000 * 60 * 60));
    return {
      valid: false,
      error: `This quote expired ${hoursExpired} hour(s) ago. Please return to My Bookings and request a new quote.`,
      expiredAt: booking.quote_expiration_date,
      isExpired: true
    };
  }

  // Vérifier si le statut est correct
  if (booking.status !== "Quote Sent") {
    return {
      valid: false,
      error: "Payment is not available for this booking. Current status: " + booking.status
    };
  }

  return { valid: true, booking };
};

/**
 * @description Traiter un paiement par carte (simul�)
 * @route POST /api/bookings/:bookingId/payment/card
 * @access Private (User)
 */
exports.processCardPayment = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const { cardNumber, cardName, expiryMonth, expiryYear, cvv } = req.body;

  // Validation basique
  if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
    return res.status(400).json({
      success: false,
      error: "All card details are required",
    });
  }

  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ Vérification de l'expiration du quote
    const quoteCheck = await checkQuoteExpiration(client, bookingId, userId);

    if (!quoteCheck.valid) {
      await client.query("ROLLBACK");
      return res.status(quoteCheck.isExpired ? 410 : 400).json({
        success: false,
        error: quoteCheck.error,
        expiredAt: quoteCheck.expiredAt,
        isExpired: quoteCheck.isExpired
      });
    }

    const booking = quoteCheck.booking;

    if (cardNumber.length < 13 || cardNumber.length > 19) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, error: "Invalid card number" });
    }

    await client.query(
      `UPDATE bookings SET status = 'Payment Confirmed',
       payment_method = 'card', payment_timestamp = NOW(),
       payment_transaction_id = $2 WHERE id = $1`,
      [bookingId, `CARD-${Date.now()}`]
    );

    // Get full booking details for notification
    const fullBookingQuery = await client.query(
      `SELECT b.*, t.name as tour_name
       FROM bookings b
       JOIN tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    // Create payment confirmed notification
    if (fullBookingQuery.rows.length > 0) {
      await notificationService.createPaymentConfirmedNotification(
        fullBookingQuery.rows[0]
      );
    }

    // COMMIT transaction FIRST to release locks
    await client.query("COMMIT");

    // Generate payment receipt PDF AFTER commit (no lock conflict)
    let pdfResult = null;
    try {
      console.log(`📄 Starting PDF generation for booking #${bookingId}...`);
      pdfResult = await bookingPdfService.generatePaymentReceiptPdf(bookingId);
      console.log(`✅ PDF receipt generated successfully!`);
      console.log(`   - Receipt Number: ${pdfResult.receiptNumber}`);
      console.log(`   - PDF Path: ${pdfResult.relativePath}`);
      console.log(`   - Full Path: ${pdfResult.filepath}`);
    } catch (pdfError) {
      console.error('❌ Error generating PDF receipt (payment already confirmed):', pdfError);
      console.error('   Error stack:', pdfError.stack);
    }

    // Send emails with PDF attached
    try {
      await sendPaymentConfirmedEmail(userId, bookingId);
      await sendBookingConfirmedEmail(userId, bookingId);
      console.log(`📧 Confirmation emails sent for booking #${bookingId}`);
    } catch (emailError) {
      console.error('⚠️ Error sending emails (payment already confirmed):', emailError);
    }

    console.log(` Card payment confirmed for booking #${bookingId}`);

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: {
        bookingId,
        bookingReference: booking.booking_reference,
        amount: booking.final_price,
        paymentMethod: "card",
        receiptPdf: pdfResult?.relativePath || null,
        receiptNumber: pdfResult?.receiptNumber || null
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error processing card payment:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    client.release();
  }
};

exports.processBankTransfer = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const { bankName, accountNumber, transactionReference } = req.body;

  if (!bankName || !accountNumber || !transactionReference) {
    return res.status(400).json({
      success: false,
      error:
        "Bank name, account number, and transaction reference are required",
    });
  }

  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ Vérification de l'expiration du quote
    const quoteCheck = await checkQuoteExpiration(client, bookingId, userId);

    if (!quoteCheck.valid) {
      await client.query("ROLLBACK");
      return res.status(quoteCheck.isExpired ? 410 : 400).json({
        success: false,
        error: quoteCheck.error,
        expiredAt: quoteCheck.expiredAt,
        isExpired: quoteCheck.isExpired
      });
    }

    const booking = quoteCheck.booking;

    await client.query(
      `UPDATE bookings SET status = 'Payment Pending',
       payment_method = 'bank_transfer', admin_notes = $1 WHERE id = $2`,
      [
        JSON.stringify({ bankName, accountNumber, transactionReference }),
        bookingId,
      ]
    );

    await client.query("COMMIT");

    console.log(`� Bank transfer pending for booking #${bookingId}`);

    res.status(200).json({
      success: true,
      message: "Bank transfer details submitted. Awaiting admin confirmation.",
      data: {
        bookingId,
        bookingReference: booking.booking_reference,
        amount: booking.final_price,
        status: "Payment Pending",
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error processing bank transfer:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    client.release();
  }
};

exports.confirmBankTransfer = async (req, res) => {
  const { bookingId } = req.params;
  const adminId = req.user.id;
  const { notes } = req.body;

  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const bookingCheck = await client.query(
      "SELECT id, user_id, final_price, booking_reference, status FROM bookings WHERE id = $1",
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    const booking = bookingCheck.rows[0];

    if (booking.status !== "Payment Pending") {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, error: "Payment is not pending confirmation" });
    }

    await client.query(
      `UPDATE bookings SET status = 'Payment Confirmed',
       payment_timestamp = NOW(), admin_notes = $1 WHERE id = $2`,
      [notes, bookingId]
    );

    // Get full booking details for notification
    const fullBookingQuery = await client.query(
      `SELECT b.*, t.name as tour_name
       FROM bookings b
       JOIN tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    // Create payment confirmed notification
    if (fullBookingQuery.rows.length > 0) {
      await notificationService.createPaymentConfirmedNotification(
        fullBookingQuery.rows[0]
      );
    }

    await client.query("COMMIT");

    try {
      await sendPaymentConfirmedEmail(booking.user_id, bookingId);
      await sendBookingConfirmedEmail(booking.user_id, bookingId);
    } catch (emailError) {
      console.error("Error sending confirmation emails:", emailError);
    }

    await logPaymentConfirmed(
      adminId,
      bookingId,
      booking.final_price,
      "bank_transfer"
    );

    console.log(` Bank transfer confirmed by admin for booking #${bookingId}`);

    res.status(200).json({
      success: true,
      message: "Bank transfer payment confirmed",
      data: {
        bookingId,
        bookingReference: booking.booking_reference,
        amount: booking.final_price,
      },
      toast: createToastNotification(
        "success",
        `Payment confirmed for ${booking.booking_reference}`
      ),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error confirming bank transfer:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    client.release();
  }
};

exports.processPayPalPayment = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const { paypalEmail, paypalTransactionId } = req.body;

  if (!paypalEmail || !paypalTransactionId) {
    return res.status(400).json({
      success: false,
      error: "PayPal email and transaction ID are required",
    });
  }

  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ Vérification de l'expiration du quote
    const quoteCheck = await checkQuoteExpiration(client, bookingId, userId);

    if (!quoteCheck.valid) {
      await client.query("ROLLBACK");
      return res.status(quoteCheck.isExpired ? 410 : 400).json({
        success: false,
        error: quoteCheck.error,
        expiredAt: quoteCheck.expiredAt,
        isExpired: quoteCheck.isExpired
      });
    }

    const booking = quoteCheck.booking;

    if (!paypalEmail.includes("@")) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, error: "Invalid PayPal email" });
    }

    await client.query(
      `UPDATE bookings SET status = 'Payment Confirmed',
       payment_method = 'paypal', payment_timestamp = NOW(),
       payment_transaction_id = $1, admin_notes = $2 WHERE id = $3`,
      [paypalTransactionId, JSON.stringify({ paypalEmail, paypalTransactionId }), bookingId]
    );

    // Get full booking details for notification
    const fullBookingQuery = await client.query(
      `SELECT b.*, t.name as tour_name
       FROM bookings b
       JOIN tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    // Create payment confirmed notification
    if (fullBookingQuery.rows.length > 0) {
      await notificationService.createPaymentConfirmedNotification(
        fullBookingQuery.rows[0]
      );
    }

    await client.query("COMMIT");

    try {
      await sendPaymentConfirmedEmail(userId, bookingId);
      await sendBookingConfirmedEmail(userId, bookingId);
    } catch (emailError) {
      console.error("Error sending confirmation emails:", emailError);
    }

    console.log(` PayPal payment confirmed for booking #${bookingId}`);

    res.status(200).json({
      success: true,
      message: "PayPal payment confirmed successfully",
      data: {
        bookingId,
        bookingReference: booking.booking_reference,
        amount: booking.final_price,
        paymentMethod: "paypal",
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error processing PayPal payment:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    client.release();
  }
};

exports.getPaymentDetails = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  try {
    const result = await db.query(
      `SELECT id, booking_reference, final_price, payment_status, payment_method,
       payment_confirmed_date, payment_metadata, user_id FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    const booking = result.rows[0];

    if (!isAdmin && booking.user_id !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        amount: booking.final_price,
        paymentStatus: booking.payment_status,
        paymentMethod: booking.payment_method,
        confirmedDate: booking.payment_confirmed_date,
        metadata: booking.payment_metadata,
      },
    });
  } catch (error) {
    console.error("Error getting payment details:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = exports;
