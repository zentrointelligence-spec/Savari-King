/**
 * Integration Tests - Booking Lifecycle
 * Tests for the complete booking lifecycle from inquiry to completion
 */

const request = require('supertest');
const app = require('../../src/index');
const { getAdminToken, getUserToken, testUsers } = require('../helpers/authHelper');
const dbHelper = require('../helpers/dbHelper');

describe('Booking Lifecycle Tests', () => {
  let adminToken;
  let userToken;
  let testTour;
  let testTier;

  // Setup: Run before all tests
  beforeAll(async () => {
    adminToken = getAdminToken();
    userToken = getUserToken();

    // Create test tour and tier
    testTour = await dbHelper.createTestTour();
    testTier = await dbHelper.createTestTier(testTour.id);
  });

  // Cleanup: Run after all tests
  afterAll(async () => {
    await dbHelper.cleanupTestData();
  });

  describe('TC-LIFECYCLE-001: Create Booking Inquiry (Inquiry Pending)', () => {
    it('should create a booking with valid data', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 2,
        num_children: 1,
        selected_addons: [
          { id: 1, name: 'Candlelight Dinner', price: 2500 }
        ],
        selected_vehicles: [],
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
        special_requests: 'Vegetarian meals please',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      // Verify response
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('booking_reference');
      expect(response.body.data.booking_reference).toMatch(/^EB-\d{4}-\d{6}$/);
      expect(response.body.data.status).toBe('Inquiry Pending');
      expect(response.body.message).toContain('30 minutes');

      // Verify database
      const booking = await dbHelper.getBookingById(response.body.data.id);
      expect(booking).toBeDefined();
      expect(booking.status).toBe('Inquiry Pending');
      expect(booking.inquiry_date).toBeDefined();
      expect(booking.user_id).toBe(testUsers.normalUser.id);
    });

    it('should generate unique booking reference', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 1,
        estimated_price: 45000,
        contact_name: 'Jane Doe',
        contact_email: 'jane@example.com',
        contact_phone: '+91 9876543211',
      };

      const response1 = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      const response2 = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...bookingData, contact_email: 'jane2@example.com' })
        .expect(201);

      expect(response1.body.data.booking_reference).not.toBe(response2.body.data.booking_reference);
    });
  });

  describe('TC-LIFECYCLE-002: Send Quote (Quote Sent)', () => {
    let bookingId;

    beforeEach(async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
      });
      bookingId = booking.id;
    });

    it('should send quote successfully', async () => {
      const quoteData = {
        final_price: 47500,
        admin_notes: 'Prix ajusté pour la haute saison',
      };

      const response = await request(app)
        .put(`/api/bookings/${bookingId}/send-quote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(quoteData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.final_price).toBe(47500);
      expect(response.body.data.quote_expiration).toBeDefined();

      // Verify database
      const booking = await dbHelper.getBookingById(bookingId);
      expect(booking.status).toBe('Quote Sent');
      expect(booking.final_price).toBe('47500.00');
      expect(booking.quote_sent_date).toBeDefined();
      expect(booking.quote_expiration_date).toBeDefined();
      expect(booking.admin_notes).toBe('Prix ajusté pour la haute saison');

      // Verify quote expires in ~48 hours
      const expirationTime = new Date(booking.quote_expiration_date);
      const now = new Date();
      const hoursDiff = (expirationTime - now) / (1000 * 60 * 60);
      expect(hoursDiff).toBeGreaterThan(47);
      expect(hoursDiff).toBeLessThan(49);
    });

    it('should reject quote without final_price', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/send-quote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ admin_notes: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Final price is required');
    });
  });

  describe('TC-LIFECYCLE-003: Payment Confirmation (Payment Confirmed)', () => {
    let bookingId;

    beforeEach(async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Quote Sent',
        final_price: 47500,
      });
      bookingId = booking.id;
      await dbHelper.setQuoteExpiration(bookingId, 48);
    });

    it('should confirm payment via webhook simulation', async () => {
      // Simulate payment webhook processing
      const paymentData = {
        transaction_id: 'TXN_123456789',
        payment_method: 'Stripe',
        amount: 47500,
      };

      // Update booking to Payment Confirmed (simulating webhook)
      await dbHelper.updateBookingStatus(bookingId, 'Payment Confirmed', {
        payment_transaction_id: paymentData.transaction_id,
        payment_method: paymentData.payment_method,
        payment_timestamp: new Date(),
      });

      // Verify database
      const booking = await dbHelper.getBookingById(bookingId);
      expect(booking.status).toBe('Payment Confirmed');
      expect(booking.payment_transaction_id).toBe('TXN_123456789');
      expect(booking.payment_method).toBe('Stripe');
      expect(booking.payment_timestamp).toBeDefined();

      // Verify cancellation deadline is 24h from payment
      const paymentTime = new Date(booking.payment_timestamp);
      const cancellationDeadline = new Date(paymentTime.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      expect(cancellationDeadline > now).toBe(true);
    });
  });

  describe('TC-LIFECYCLE-004: Cancel Before Payment', () => {
    it('should allow cancellation for Inquiry Pending status', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
      });

      const response = await request(app)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.refund_status).toBe('not_applicable');

      // Verify database
      const updatedBooking = await dbHelper.getBookingById(booking.id);
      expect(updatedBooking.status).toBe('Cancelled');
      expect(updatedBooking.cancellation_date).toBeDefined();
    });

    it('should allow cancellation for Quote Sent status', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Quote Sent',
        final_price: 47500,
      });

      const response = await request(app)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.refund_status).toBe('not_applicable');
    });
  });

  describe('TC-LIFECYCLE-005: Cancel Within 24h After Payment (Accepted)', () => {
    it('should allow cancellation within 24 hours of payment', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        final_price: 47500,
      });

      // Set payment timestamp to 12 hours ago
      await dbHelper.setPaymentTimestamp(booking.id, 12);

      const response = await request(app)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.refund_status).toBe('pending');

      // Verify database
      const updatedBooking = await dbHelper.getBookingById(booking.id);
      expect(updatedBooking.status).toBe('Cancelled');
      expect(updatedBooking.cancellation_date).toBeDefined();
    });

    it('should accept cancellation at exactly 23h 59m', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        final_price: 47500,
      });

      // Set payment timestamp to 23.98 hours ago (23h 59m)
      await dbHelper.setPaymentTimestamp(booking.id, 23.98);

      const response = await request(app)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('TC-LIFECYCLE-006: Cancel After 24h - Rejected', () => {
    it('should reject cancellation after 24 hours', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        final_price: 47500,
      });

      // Set payment timestamp to 36 hours ago
      await dbHelper.setPaymentTimestamp(booking.id, 36);

      const response = await request(app)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('24-hour free cancellation window has expired');
      expect(response.body.cancellation_deadline).toBeDefined();

      // Verify status unchanged
      const updatedBooking = await dbHelper.getBookingById(booking.id);
      expect(updatedBooking.status).toBe('Payment Confirmed');
    });

    it('should reject at exactly 24h 1m', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        final_price: 47500,
      });

      // Set payment timestamp to 24.02 hours ago (24h 1m)
      await dbHelper.setPaymentTimestamp(booking.id, 24.02);

      const response = await request(app)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('TC-LIFECYCLE-007: Complete Booking (Trip Completed)', () => {
    it('should mark booking as completed (admin action)', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Payment Confirmed',
        final_price: 47500,
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ admin_notes: 'Voyage terminé sans incident' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('completed');

      // Verify database
      const updatedBooking = await dbHelper.getBookingById(booking.id);
      expect(updatedBooking.status).toBe('Trip Completed');
      expect(updatedBooking.completion_date).toBeDefined();
      expect(updatedBooking.admin_notes).toBe('Voyage terminé sans incident');
    });
  });

  describe('TC-LIFECYCLE-008: Reject Completion Without Payment', () => {
    it('should reject completion for Inquiry Pending status', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Only confirmed bookings can be marked as completed');

      // Verify status unchanged
      const updatedBooking = await dbHelper.getBookingById(booking.id);
      expect(updatedBooking.status).toBe('Inquiry Pending');
    });

    it('should reject completion for Quote Sent status', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Quote Sent',
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
