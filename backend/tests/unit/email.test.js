/**
 * Unit Tests - Email Service
 * Tests for email templates and sending logic
 */

const emailService = require('../../src/services/emailServiceNew');
const dbHelper = require('../helpers/dbHelper');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id-123',
    }),
  }),
}));

describe('Email Service Tests', () => {
  let testTour;
  let testTier;

  beforeAll(async () => {
    testTour = await dbHelper.createTestTour();
    testTier = await dbHelper.createTestTier(testTour.id);
  });

  afterAll(async () => {
    await dbHelper.cleanupTestData();
  });

  describe('TC-EMAIL-001: Inquiry Received Email (User)', () => {
    it('should send inquiry confirmation email to user', async () => {
      const bookingData = {
        id: 1,
        user_id: 2,
        booking_reference: 'EB-2025-001234',
        tour_name: 'Kerala Paradise',
        tier_name: 'Standard',
        travel_date: '2025-01-15',
        num_adults: 2,
        num_children: 1,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
        special_requests: 'Vegetarian meals',
        selected_addons: [],
        selected_vehicles: [],
        inquiry_date: new Date(),
      };

      await expect(
        emailService.sendInquiryConfirmationEmailToUser(bookingData)
      ).resolves.not.toThrow();
    });
  });

  describe('TC-EMAIL-002: New Inquiry Email (Admin)', () => {
    it('should send new inquiry alert to admin', async () => {
      const bookingData = {
        id: 1,
        booking_reference: 'EB-2025-001234',
        tour_name: 'Kerala Paradise',
        tier_name: 'Standard',
        travel_date: '2025-01-15',
        num_adults: 2,
        num_children: 1,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
        user_id: 2,
        special_requests: 'Vegetarian meals',
        selected_addons: [],
        selected_vehicles: [],
        inquiry_date: new Date(),
      };

      await expect(
        emailService.sendNewInquiryEmailToAdmin(bookingData)
      ).resolves.not.toThrow();
    });
  });

  describe('TC-EMAIL-003: Quote Ready Email (User)', () => {
    it('should send quote email to user', async () => {
      const bookingData = {
        id: 1,
        booking_reference: 'EB-2025-001234',
        tour_name: 'Kerala Paradise',
        tier_name: 'Standard',
        travel_date: '2025-01-15',
        num_adults: 2,
        num_children: 1,
        final_price: 47500,
        tier_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        quote_expiration_date: new Date(Date.now() + 48 * 60 * 60 * 1000),
        admin_notes: 'High season adjustment',
        selected_addons: [
          { id: 1, name: 'Candlelight Dinner', price: 2500 }
        ],
        selected_vehicles: [],
        user_id: 2,
      };

      await expect(
        emailService.sendQuoteEmailToUser(bookingData)
      ).resolves.not.toThrow();
    });
  });

  describe('TC-EMAIL-004: Payment Confirmed Email (User)', () => {
    it('should send payment confirmation email', async () => {
      const bookingData = {
        id: 1,
        booking_reference: 'EB-2025-001234',
        tour_name: 'Kerala Paradise',
        tier_name: 'Standard',
        travel_date: '2025-01-15',
        num_adults: 2,
        num_children: 0,
        final_price: 47500,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        payment_timestamp: new Date(),
      };

      await expect(
        emailService.sendPaymentConfirmationEmailToUser(bookingData)
      ).resolves.not.toThrow();
    });
  });

  describe('TC-EMAIL-005: Payment Alert Email (Admin)', () => {
    it('should send payment alert to admin', async () => {
      const bookingData = {
        id: 1,
        booking_reference: 'EB-2025-001234',
        tour_name: 'Kerala Paradise',
        tier_name: 'Standard',
        travel_date: '2025-01-20',
        num_adults: 2,
        num_children: 0,
        final_price: 47500,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
        user_id: 2,
        special_requests: null,
        payment_timestamp: new Date(),
        quote_sent_date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      };

      await expect(
        emailService.sendPaymentAlertEmailToAdmin(bookingData)
      ).resolves.not.toThrow();
    });
  });

  describe('TC-EMAIL-006: Cancellation Confirmed Email', () => {
    it('should send cancellation email with refund info', async () => {
      const bookingData = {
        booking_reference: 'EB-2025-001234',
        tour_name: 'Kerala Paradise',
        tier_name: 'Standard',
        travel_date: '2025-01-15',
        final_price: 47500,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        cancellation_date: new Date(),
        refund_eligible: true,
        refund_amount: 47500,
        user_id: 2,
        id: 1,
      };

      await expect(
        emailService.sendCancellationEmailToUser(bookingData)
      ).resolves.not.toThrow();
    });

    it('should send cancellation email without refund', async () => {
      const bookingData = {
        booking_reference: 'EB-2025-001234',
        tour_name: 'Kerala Paradise',
        tier_name: 'Standard',
        travel_date: '2025-01-15',
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        cancellation_date: new Date(),
        refund_eligible: false,
        refund_amount: 0,
        user_id: 2,
        id: 1,
      };

      await expect(
        emailService.sendCancellationEmailToUser(bookingData)
      ).resolves.not.toThrow();
    });
  });

  describe('TC-EMAIL-007: Trip Review Request Email', () => {
    it('should send review request email', async () => {
      const bookingData = {
        id: 1,
        booking_reference: 'EB-2025-001234',
        tour_name: 'Kerala Paradise',
        tier_name: 'Standard',
        travel_date: '2025-01-15',
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
      };

      await expect(
        emailService.sendTripReviewRequestEmail(bookingData)
      ).resolves.not.toThrow();
    });
  });

  describe('TC-EMAIL-008: Email Error Handling', () => {
    it('should handle email sending errors gracefully', async () => {
      // Mock sendMail to reject
      const nodemailer = require('nodemailer');
      nodemailer.createTransport().sendMail.mockRejectedValueOnce(
        new Error('SMTP connection failed')
      );

      const bookingData = {
        id: 1,
        booking_reference: 'EB-2025-001234',
        tour_name: 'Test Tour',
        tier_name: 'Standard',
        travel_date: '2025-01-15',
        contact_name: 'Test User',
        contact_email: 'test@example.com',
        num_adults: 1,
        num_children: 0,
        estimated_price: 45000,
        inquiry_date: new Date(),
        selected_addons: [],
        selected_vehicles: [],
      };

      // Email failure should throw (to be caught in controller)
      await expect(
        emailService.sendInquiryConfirmationEmailToUser(bookingData)
      ).rejects.toThrow();
    });
  });

  describe('Email Template Variable Replacement', () => {
    it('should load and render email template with variables', async () => {
      const variables = {
        contact_name: 'John Doe',
        booking_reference: 'EB-2025-001234',
        tour_name: 'Kerala Paradise',
        travel_date: 'Monday, January 15, 2025',
        num_adults: 2,
        num_children: 1,
        estimated_price: '45,000',
        current_year: new Date().getFullYear(),
        frontend_url: 'http://localhost:3000',
      };

      const html = await emailService.loadTemplate('inquiry_received', variables);

      expect(html).toContain('John Doe');
      expect(html).toContain('EB-2025-001234');
      expect(html).toContain('Kerala Paradise');
      expect(html).not.toContain('{{contact_name}}');
      expect(html).not.toContain('{{booking_reference}}');
    });
  });
});
