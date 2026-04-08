/**
 * Integration Tests - Security & Permissions
 * Tests for authentication, authorization, and data isolation
 */

const request = require('supertest');
const app = require('../../src/index');
const {
  getAdminToken,
  getUserToken,
  getAnotherUserToken,
  generateExpiredToken,
  generateInvalidToken,
  testUsers,
} = require('../helpers/authHelper');
const dbHelper = require('../helpers/dbHelper');

describe('Security & Permission Tests', () => {
  let adminToken;
  let userToken;
  let anotherUserToken;
  let testTour;
  let testTier;

  beforeAll(async () => {
    adminToken = getAdminToken();
    userToken = getUserToken();
    anotherUserToken = getAnotherUserToken();
    testTour = await dbHelper.createTestTour();
    testTier = await dbHelper.createTestTier(testTour.id);
  });

  afterAll(async () => {
    await dbHelper.cleanupTestData();
  });

  describe('TC-SECURITY-001: Admin Access - Authentication Required', () => {
    it('should reject admin endpoint without token', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/all')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized');
    });

    it('should reject admin stats without token', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject send-quote without token', async () => {
      const response = await request(app)
        .put('/api/bookings/1/send-quote')
        .send({ final_price: 50000 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject complete booking without token', async () => {
      const response = await request(app)
        .put('/api/bookings/1/complete')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('TC-SECURITY-002: Admin Role Required', () => {
    it('should reject normal user accessing admin/all', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized as admin');
    });

    it('should reject normal user accessing admin/stats', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject normal user sending quote', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/send-quote`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ final_price: 50000 })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject normal user completing booking', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Payment Confirmed',
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/complete`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should allow admin to access admin endpoints', async () => {
      const response = await request(app)
        .get('/api/bookings/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('TC-SECURITY-003: User Can Only See Their Own Bookings', () => {
    it('should not return another user\'s booking', async () => {
      // Create booking for normalUser
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
      });

      // Try to access with anotherUser's token
      const response = await request(app)
        .get(`/api/bookings/${booking.id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Booking not found');
    });

    it('should return own booking successfully', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
      });

      const response = await request(app)
        .get(`/api/bookings/${booking.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(booking.id);
    });

    it('should only list own bookings in /user endpoint', async () => {
      // Create bookings for different users
      await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        contact_email: 'user1@example.com',
      });

      await dbHelper.createTestBooking({
        user_id: testUsers.anotherUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        contact_email: 'user2@example.com',
      });

      // Request with normalUser token
      const response = await request(app)
        .get('/api/bookings/user')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify all returned bookings belong to normalUser
      response.body.data.forEach(booking => {
        expect(booking.user_id).toBe(testUsers.normalUser.id);
      });

      // Verify anotherUser's booking is NOT in the list
      const emails = response.body.data.map(b => b.contact_email);
      expect(emails).not.toContain('user2@example.com');
    });
  });

  describe('TC-SECURITY-004: User Can Only Cancel Their Own Bookings', () => {
    it('should prevent user from cancelling another user\'s booking', async () => {
      // Create booking for normalUser
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
      });

      // Try to cancel with anotherUser's token
      const response = await request(app)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);

      // Verify booking status is unchanged
      const unchangedBooking = await dbHelper.getBookingById(booking.id);
      expect(unchangedBooking.status).toBe('Inquiry Pending');
    });

    it('should allow user to cancel their own booking', async () => {
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
    });
  });

  describe('TC-SECURITY-005: JWT Token Validation', () => {
    it('should reject expired token', async () => {
      const expiredToken = generateExpiredToken(testUsers.normalUser);

      const response = await request(app)
        .get('/api/bookings/user')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized');
    });

    it('should reject invalid token (wrong signature)', async () => {
      const invalidToken = generateInvalidToken(testUsers.normalUser);

      const response = await request(app)
        .get('/api/bookings/user')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject malformed token', async () => {
      const response = await request(app)
        .get('/api/bookings/user')
        .set('Authorization', 'Bearer invalid-malformed-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject empty token', async () => {
      const response = await request(app)
        .get('/api/bookings/user')
        .set('Authorization', 'Bearer ')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/bookings/user')
        .set('Authorization', userToken) // Missing "Bearer"
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('TC-SECURITY-006: SQL Injection Protection', () => {
    it('should safely handle SQL injection in contact_name', async () => {
      const maliciousData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 1,
        estimated_price: 45000,
        contact_name: "'; DROP TABLE bookings; --",
        contact_email: 'hacker@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(maliciousData)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Verify booking was created with literal string
      const booking = await dbHelper.getBookingById(response.body.data.id);
      expect(booking.contact_name).toBe("'; DROP TABLE bookings; --");

      // Verify table still exists and is functional
      const tableCheck = await request(app)
        .get('/api/bookings/user')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(tableCheck.body.success).toBe(true);
    });

    it('should safely handle SQL injection in special_requests', async () => {
      const maliciousData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 1,
        estimated_price: 45000,
        contact_name: 'Test User',
        contact_email: 'test@example.com',
        contact_phone: '+91 9876543210',
        special_requests: "' OR '1'='1",
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(maliciousData)
        .expect(201);

      expect(response.body.success).toBe(true);

      const booking = await dbHelper.getBookingById(response.body.data.id);
      expect(booking.special_requests).toBe("' OR '1'='1");
    });

    it('should safely handle SQL injection in admin_notes', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Inquiry Pending',
      });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/send-quote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          final_price: 50000,
          admin_notes: "'; DELETE FROM bookings WHERE '1'='1",
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify malicious content stored as literal string
      const updatedBooking = await dbHelper.getBookingById(booking.id);
      expect(updatedBooking.admin_notes).toBe("'; DELETE FROM bookings WHERE '1'='1");

      // Verify no bookings were deleted
      const allBookings = await request(app)
        .get('/api/bookings/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(allBookings.body.data.length).toBeGreaterThan(0);
    });
  });
});
