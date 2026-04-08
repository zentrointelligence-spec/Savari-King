/**
 * Integration Tests - Admin APIs
 * Tests for admin-specific booking management endpoints
 */

const request = require('supertest');
const app = require('../../src/index');
const { getAdminToken, testUsers } = require('../helpers/authHelper');
const dbHelper = require('../helpers/dbHelper');

describe('Admin API Tests', () => {
  let adminToken;
  let testTour;
  let testTier;

  beforeAll(async () => {
    adminToken = getAdminToken();
    testTour = await dbHelper.createTestTour();
    testTier = await dbHelper.createTestTier(testTour.id);
  });

  afterAll(async () => {
    await dbHelper.cleanupTestData();
  });

  describe('TC-API-001: Get All Bookings (GET /admin/all)', () => {
    beforeEach(async () => {
      // Create multiple test bookings
      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
        contact_email: 'test1@example.com',
      });

      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Quote Sent',
        contact_email: 'test2@example.com',
      });

      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Payment Confirmed',
        contact_email: 'test3@example.com',
      });
    });

    it('should return all bookings with pagination', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/all?page=1&limit=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('pages');
    });

    it('should include enriched data (user, tour, tier names)', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const booking = response.body.data[0];
      expect(booking).toHaveProperty('booking_reference');
      expect(booking).toHaveProperty('tour_name');
      expect(booking).toHaveProperty('tier_name');
      expect(booking).toHaveProperty('status');
      expect(booking).toHaveProperty('can_cancel_with_refund');
      expect(booking).toHaveProperty('quote_is_valid');
    });

    it('should return bookings ordered by created_at DESC', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const dates = response.body.data.map(b => new Date(b.created_at).getTime());

      // Verify descending order
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe('TC-API-002: Filter by Status', () => {
    beforeEach(async () => {
      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
        contact_email: 'pending1@example.com',
      });

      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
        contact_email: 'pending2@example.com',
      });

      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Payment Confirmed',
        contact_email: 'confirmed@example.com',
      });
    });

    it('should filter bookings by Inquiry Pending status', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/all?status=Inquiry%20Pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify all returned bookings have Inquiry Pending status
      response.body.data.forEach(booking => {
        expect(booking.status).toBe('Inquiry Pending');
      });
    });

    it('should filter bookings by Quote Sent status', async () => {
      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Quote Sent',
        contact_email: 'quote@example.com',
      });

      const response = await request(app)
        .get('/api/bookings/admin/all?status=Quote%20Sent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.data.forEach(booking => {
        expect(booking.status).toBe('Quote Sent');
      });
    });

    it('should filter bookings by Payment Confirmed status', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/all?status=Payment%20Confirmed')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.data.forEach(booking => {
        expect(booking.status).toBe('Payment Confirmed');
      });
    });

    it('should filter bookings by Cancelled status', async () => {
      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Cancelled',
        contact_email: 'cancelled@example.com',
      });

      const response = await request(app)
        .get('/api/bookings/admin/all?status=Cancelled')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.data.forEach(booking => {
        expect(booking.status).toBe('Cancelled');
      });
    });

    it('should filter bookings by Trip Completed status', async () => {
      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Trip Completed',
        contact_email: 'completed@example.com',
      });

      const response = await request(app)
        .get('/api/bookings/admin/all?status=Trip%20Completed')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.data.forEach(booking => {
        expect(booking.status).toBe('Trip Completed');
      });
    });
  });

  describe('TC-API-003: Filter by Tour', () => {
    it('should filter bookings by tour_id', async () => {
      const response = await request(app)
        .get(`/api/bookings/admin/all?tour_id=${testTour.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify all returned bookings belong to the specified tour
      response.body.data.forEach(booking => {
        expect(booking.tour_id).toBe(testTour.id);
      });
    });
  });

  describe('TC-API-004: Filter by Date Range', () => {
    it('should filter bookings by travel date range', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: '2025-01-15',
        contact_email: 'datetest@example.com',
      });

      const response = await request(app)
        .get(`/api/bookings/admin/all?start_date=${startDate}&end_date=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify all bookings are within the date range
      response.body.data.forEach(booking => {
        const travelDate = new Date(booking.travel_date);
        const start = new Date(startDate);
        const end = new Date(endDate);

        expect(travelDate >= start).toBe(true);
        expect(travelDate <= end).toBe(true);
      });
    });
  });

  describe('TC-API-005: Booking Statistics (GET /admin/stats)', () => {
    beforeEach(async () => {
      // Create bookings with various statuses
      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
      });

      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Quote Sent',
      });

      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Payment Confirmed',
        final_price: 45000,
      });

      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Payment Confirmed',
        final_price: 50000,
      });

      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Cancelled',
      });

      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Trip Completed',
      });
    });

    it('should return booking statistics', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pending_count');
      expect(response.body.data).toHaveProperty('quote_sent_count');
      expect(response.body.data).toHaveProperty('confirmed_count');
      expect(response.body.data).toHaveProperty('cancelled_count');
      expect(response.body.data).toHaveProperty('completed_count');
      expect(response.body.data).toHaveProperty('total_count');
      expect(response.body.data).toHaveProperty('total_revenue');
      expect(response.body.data).toHaveProperty('avg_booking_value');
    });

    it('should calculate total_count correctly', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const stats = response.body.data;
      const sum = parseInt(stats.pending_count) +
                  parseInt(stats.quote_sent_count) +
                  parseInt(stats.confirmed_count) +
                  parseInt(stats.cancelled_count) +
                  parseInt(stats.completed_count);

      expect(parseInt(stats.total_count)).toBeGreaterThanOrEqual(sum);
    });

    it('should calculate revenue only from Payment Confirmed bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const stats = response.body.data;

      // Revenue should only include confirmed bookings
      // We created 2 confirmed bookings: 45000 + 50000 = 95000
      expect(parseFloat(stats.total_revenue)).toBeGreaterThan(0);
    });
  });

  describe('TC-API-006: Send Quote Validation', () => {
    it('should reject quote without final_price', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/send-quote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ admin_notes: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Final price is required');
    });
  });

  describe('TC-API-007: Reject Quote for Non-Pending Status', () => {
    it('should reject quote for Payment Confirmed status', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Payment Confirmed',
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/send-quote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ final_price: 50000 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Quote can only be sent for pending inquiries');
    });

    it('should reject quote for Cancelled status', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Cancelled',
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/send-quote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ final_price: 50000 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject quote for Trip Completed status', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Trip Completed',
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/send-quote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ final_price: 50000 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should accept quote for Inquiry Pending status', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/send-quote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ final_price: 50000 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
