/**
 * Quote Email Service
 * Handles sending quote emails with PDF attachments
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class QuoteEmailService {
  constructor() {
    // Create transporter with email configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        // Don't fail on invalid certificates in development
        rejectUnauthorized: false
      }
    });
  }

  /**
   * Format currency to Indian Rupees
   */
  formatCurrency(amount) {
    return `₹${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  /**
   * Format date to readable format
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Generate HTML email template for quote
   */
  generateQuoteEmailTemplate(bookingData, totalAmount, appliedOffers = []) {
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 48);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1F2937;
            margin-bottom: 20px;
          }
          .message {
            color: #4B5563;
            font-size: 15px;
            margin-bottom: 25px;
            line-height: 1.8;
          }
          .info-box {
            background: #F9FAFB;
            border-left: 4px solid #3B82F6;
            padding: 20px;
            margin: 25px 0;
            border-radius: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #E5E7EB;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: 600;
            color: #6B7280;
          }
          .info-value {
            color: #1F2937;
            font-weight: 500;
          }
          .total-box {
            background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            color: white;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
          }
          .total-label {
            font-size: 16px;
            margin-bottom: 10px;
          }
          .total-amount {
            font-size: 32px;
            font-weight: 700;
          }
          .cta-button {
            display: inline-block;
            background: #3B82F6;
            color: white;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
            text-align: center;
          }
          .attachments {
            background: #FEF3C7;
            border: 1px solid #FCD34D;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .attachments h3 {
            margin: 0 0 10px 0;
            color: #92400E;
            font-size: 16px;
          }
          .attachments ul {
            margin: 0;
            padding-left: 20px;
            color: #78350F;
          }
          .footer {
            background: #F9FAFB;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
          }
          .footer p {
            margin: 5px 0;
            color: #6B7280;
            font-size: 13px;
          }
          .note {
            background: #DBEAFE;
            border-left: 4px solid #3B82F6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #1E40AF;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>Your Travel Quote is Ready!</h1>
            <p>Ebenezer Tours & Travels</p>
          </div>

          <!-- Content -->
          <div class="content">
            <p class="greeting">Dear ${bookingData.contact_name},</p>

            <p class="message">
              Thank you for your interest in <strong>${bookingData.tour_name}</strong>!
              We are pleased to provide you with a detailed quotation for your upcoming journey.
              Our team has carefully prepared this quote based on your requirements and preferences.
            </p>

            <!-- Booking Details -->
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Reference Number:</span>
                <span class="info-value">${bookingData.booking_reference}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tour Name:</span>
                <span class="info-value">${bookingData.tour_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Travel Date:</span>
                <span class="info-value">${this.formatDate(bookingData.travel_date)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Travelers:</span>
                <span class="info-value">${bookingData.num_adults} Adults, ${bookingData.num_children} Children</span>
              </div>
              <div class="info-row">
                <span class="info-label">Package Type:</span>
                <span class="info-value">${bookingData.tier_name || 'Standard'}</span>
              </div>
            </div>

            ${appliedOffers && appliedOffers.length > 0 ? `
            <!-- Special Offers Applied -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 15px 0;">
                ✨ Special Offers Applied to Your Quote!
              </h3>
              ${appliedOffers.map(offer => `
                <div style="background: white; padding: 12px; margin: 10px 0; border-radius: 6px; border: 1px solid #bfdbfe;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <strong style="color: #1e40af; font-size: 15px;">${offer.offer_title}</strong>
                    <span style="background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                      ${offer.offer_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div style="color: #475569; font-size: 13px; margin-bottom: 8px;">
                    ${offer.reason}
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #64748b; font-size: 12px;">Discount:</span>
                    <strong style="color: #059669; font-size: 16px;">-${this.formatCurrency(offer.discount_amount)} (${offer.discount_percentage}%)</strong>
                  </div>
                </div>
              `).join('')}
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #bfdbfe; text-align: center;">
                <p style="color: #059669; font-size: 16px; font-weight: 600; margin: 0;">
                  💰 You're saving ${this.formatCurrency(appliedOffers.reduce((sum, o) => sum + parseFloat(o.discount_amount || 0), 0))} with these special offers!
                </p>
              </div>
            </div>
            ` : ''}

            <!-- Total Amount -->
            <div class="total-box">
              <div class="total-label">TOTAL AMOUNT</div>
              <div class="total-amount">${this.formatCurrency(totalAmount)}</div>
              ${appliedOffers && appliedOffers.length > 0 ? `
                <p style="margin: 10px 0 0 0; font-size: 13px; opacity: 0.9;">
                  (After ${appliedOffers.length} special offer${appliedOffers.length > 1 ? 's' : ''})
                </p>
              ` : ''}
            </div>

            <!-- Quote Links -->
            <div class="attachments">
              <h3>📄 View Your Quotations</h3>
              <div style="margin-top: 15px;">
                <a href="${process.env.FRONTEND_URL}/my-bookings/${bookingData.booking_id}/quote/detailed"
                   style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px; font-weight: 600;">
                  View Detailed Quote
                </a>
                <a href="${process.env.FRONTEND_URL}/my-bookings/${bookingData.booking_id}/quote/general"
                   style="display: inline-block; background: #6B7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px; font-weight: 600;">
                  View General Quote
                </a>
              </div>
              <p style="margin-top: 10px; font-size: 12px; color: #78350F;">
                Click the buttons above to view your quotations online. You can accept, share, or download them from your account.
              </p>
            </div>

            <!-- Important Note -->
            <div class="note">
              <strong>⏰ Important:</strong> This quotation is valid until <strong>${this.formatDate(validUntil)}</strong> (48 hours from now).
              Please review the attached documents and let us know if you have any questions or would like to proceed with the booking.
            </div>

            <!-- Call to Action -->
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/my-bookings" class="cta-button">
                View in My Account
              </a>
            </div>

            <p class="message">
              You can also download these quotations anytime from your account dashboard.
              If you would like to accept this quote and proceed with payment, simply log in to your account and follow the booking instructions.
            </p>

            <p class="message">
              Should you have any questions or require any modifications, please don't hesitate to contact us.
              Our team is here to ensure your travel experience is perfect!
            </p>

            <p class="message" style="margin-top: 30px;">
              <strong>Warm regards,</strong><br>
              The Ebenezer Tours Team
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong>Ebenezer Tours & Travels</strong></p>
            <p>Email: info@ebenezertours.com | Phone: +91 123 456 7890</p>
            <p>Website: www.ebenezertours.com</p>
            <p style="margin-top: 15px; font-size: 12px;">
              © ${new Date().getFullYear()} Ebenezer Tours & Travels. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send quote email with links to web pages
   */
  async sendQuoteEmail(bookingData, totalAmount, appliedOffers = []) {
    try {
      // Email options
      const mailOptions = {
        from: {
          name: 'Ebenezer Tours & Travels',
          address: process.env.SMTP_USER || 'noreply@ebenezertours.com'
        },
        to: bookingData.contact_email,
        subject: `Your Travel Quote - ${bookingData.tour_name} (Ref: ${bookingData.booking_reference})`,
        html: this.generateQuoteEmailTemplate(bookingData, totalAmount, appliedOffers)
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      console.log('Quote email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending quote email:', error);
      throw new Error(`Failed to send quote email: ${error.message}`);
    }
  }

  /**
   * Generate HTML email template for quote acceptance (client)
   */
  generateAcceptanceEmailTemplate(bookingData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .success-icon {
            text-align: center;
            font-size: 60px;
            margin: 20px 0;
          }
          .message {
            color: #4B5563;
            font-size: 15px;
            margin-bottom: 20px;
            line-height: 1.8;
          }
          .info-box {
            background: #F9FAFB;
            border-left: 4px solid #10B981;
            padding: 20px;
            margin: 25px 0;
            border-radius: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #E5E7EB;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: 600;
            color: #6B7280;
          }
          .info-value {
            color: #1F2937;
            font-weight: 500;
          }
          .cta-button {
            display: inline-block;
            background: #3B82F6;
            color: white;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
            text-align: center;
          }
          .footer {
            background: #F9FAFB;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
          }
          .footer p {
            margin: 5px 0;
            color: #6B7280;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Quote Accepted Successfully!</h1>
            <p>Ebenezer Tours & Travels</p>
          </div>

          <div class="content">
            <div class="success-icon">✅</div>

            <p class="message">Dear ${bookingData.contact_name},</p>

            <p class="message">
              Thank you for accepting our quotation! We're thrilled to confirm that your booking for
              <strong>${bookingData.tour_name}</strong> has been successfully updated.
            </p>

            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Reference Number:</span>
                <span class="info-value">${bookingData.booking_reference}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tour Name:</span>
                <span class="info-value">${bookingData.tour_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Travel Date:</span>
                <span class="info-value">${this.formatDate(bookingData.travel_date)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Amount:</span>
                <span class="info-value">${this.formatCurrency(bookingData.final_price)}</span>
              </div>
            </div>

            <p class="message">
              <strong>Next Steps:</strong>
            </p>
            <ol class="message">
              <li>Proceed to payment by clicking the button below</li>
              <li>Complete the payment process to confirm your booking</li>
              <li>Receive your booking confirmation and travel documents</li>
            </ol>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/my-bookings/${bookingData.booking_id}/payment" class="cta-button">
                Proceed to Payment
              </a>
            </div>

            <p class="message">
              If you have any questions or need assistance, please don't hesitate to contact us.
              Our team is here to help make your journey unforgettable!
            </p>

            <p class="message" style="margin-top: 30px;">
              <strong>Warm regards,</strong><br>
              The Ebenezer Tours Team
            </p>
          </div>

          <div class="footer">
            <p><strong>Ebenezer Tours & Travels</strong></p>
            <p>Email: info@ebenezertours.com | Phone: +91 123 456 7890</p>
            <p>Website: www.ebenezertours.com</p>
            <p style="margin-top: 15px; font-size: 12px;">
              © ${new Date().getFullYear()} Ebenezer Tours & Travels. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML email template for quote acceptance notification (admin)
   */
  generateAdminAcceptanceNotificationTemplate(bookingData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .alert-icon {
            text-align: center;
            font-size: 60px;
            margin: 20px 0;
          }
          .message {
            color: #4B5563;
            font-size: 15px;
            margin-bottom: 20px;
            line-height: 1.8;
          }
          .info-box {
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 20px;
            margin: 25px 0;
            border-radius: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #FDE68A;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: 600;
            color: #92400E;
          }
          .info-value {
            color: #78350F;
            font-weight: 500;
          }
          .cta-button {
            display: inline-block;
            background: #F59E0B;
            color: white;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
            text-align: center;
          }
          .footer {
            background: #F9FAFB;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Quote Accepted - Action Required</h1>
          </div>

          <div class="content">
            <div class="alert-icon">✅</div>

            <p class="message">
              <strong>Good news!</strong> A client has accepted their quotation and is ready to proceed with payment.
            </p>

            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Booking Reference:</span>
                <span class="info-value">${bookingData.booking_reference}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Client Name:</span>
                <span class="info-value">${bookingData.contact_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Client Email:</span>
                <span class="info-value">${bookingData.contact_email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tour Name:</span>
                <span class="info-value">${bookingData.tour_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Travel Date:</span>
                <span class="info-value">${this.formatDate(bookingData.travel_date)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Amount:</span>
                <span class="info-value">${this.formatCurrency(bookingData.final_price)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Accepted At:</span>
                <span class="info-value">${this.formatDate(new Date())}</span>
              </div>
            </div>

            <p class="message">
              <strong>Next Actions:</strong>
            </p>
            <ul class="message">
              <li>Monitor for payment completion</li>
              <li>Prepare booking confirmation documents</li>
              <li>Coordinate with service providers</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/admin/bookings/${bookingData.booking_id}" class="cta-button">
                View Booking Details
              </a>
            </div>

            <p class="message" style="margin-top: 30px;">
              This is an automated notification from the Ebenezer Tours booking system.
            </p>
          </div>

          <div class="footer">
            <p><strong>Ebenezer Tours & Travels - Admin System</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send quote acceptance confirmation email to client
   */
  async sendQuoteAcceptanceEmailToClient(bookingData) {
    try {
      const mailOptions = {
        from: {
          name: 'Ebenezer Tours & Travels',
          address: process.env.SMTP_USER || 'noreply@ebenezertours.com'
        },
        to: bookingData.contact_email,
        subject: `Quote Accepted - Next Steps (Ref: ${bookingData.booking_reference})`,
        html: this.generateAcceptanceEmailTemplate(bookingData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Acceptance confirmation email sent to client:', info.messageId);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending acceptance email to client:', error);
      throw new Error(`Failed to send acceptance email: ${error.message}`);
    }
  }

  /**
   * Send quote acceptance notification email to admin
   */
  async sendQuoteAcceptanceEmailToAdmin(bookingData) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@ebenezertours.com';

      const mailOptions = {
        from: {
          name: 'Ebenezer Tours System',
          address: process.env.SMTP_USER || 'noreply@ebenezertours.com'
        },
        to: adminEmail,
        subject: `🔔 Quote Accepted - ${bookingData.booking_reference}`,
        html: this.generateAdminAcceptanceNotificationTemplate(bookingData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Acceptance notification email sent to admin:', info.messageId);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending acceptance notification to admin:', error);
      throw new Error(`Failed to send admin notification: ${error.message}`);
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email server is ready to send messages');
      return true;
    } catch (error) {
      console.error('Email server verification failed:', error);
      return false;
    }
  }
}

module.exports = new QuoteEmailService();
