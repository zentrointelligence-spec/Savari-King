/**
 * Integration Tests - Booking Validations
 * Tests for business rule validations
 */

const request = require('supertest');
const app = require('../../src/index');
const { getUserToken, testUsers } = require('../helpers/authHelper');
const dbHelper = require('../helpers/dbHelper');

describe('Booking Validation Tests', () => {
  let userToken;
  let testTour;
  let testTier;

  beforeAll(async () => {
    userToken = getUserToken();
    testTour = await dbHelper.createTestTour();
    testTier = await dbHelper.createTestTier(testTour.id);
  });

  afterAll(async () => {
    await dbHelper.cleanupTestData();
  });

  describe('TC-VALIDATION-001: Travel Date < 5 Days - Rejected', () => {
    it('should reject booking with travel date less than 5 days', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateInvalidTravelDate(), // 2 days from now
        num_adults: 2,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('at least 5 days in the future');
      expect(response.body.earliestDate).toBeDefined();
    });

    it('should reject booking with travel date = tomorrow', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: tomorrow.toISOString().split('T')[0],
        num_adults: 1,
        estimated_price: 45000,
        contact_name: 'Jane Doe',
        contact_email: 'jane@example.com',
        contact_phone: '+91 9876543211',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should accept booking with travel date exactly 5 days', async () => {
      const fiveDaysLater = new Date();
      fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);

      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: fiveDaysLater.toISOString().split('T')[0],
        num_adults: 1,
        estimated_price: 45000,
        contact_name: 'Valid User',
        contact_email: 'valid@example.com',
        contact_phone: '+91 9876543212',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('TC-VALIDATION-002: Invalid Date Format', () => {
    it('should reject invalid date format', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: 'invalid-date',
        num_adults: 1,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid travel date format');
    });

    it('should reject date in wrong format (DD-MM-YYYY)', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: '15-01-2025',
        num_adults: 1,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('TC-VALIDATION-003: Number of Adults - Limits', () => {
    it('should reject num_adults = 0', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 0,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Number of adults must be between 1 and 20');
    });

    it('should reject num_adults = 25 (> 20)', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 25,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Number of adults must be between 1 and 20');
    });

    it('should accept num_adults = 1 (minimum)', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 1,
        estimated_price: 45000,
        contact_name: 'Solo Traveler',
        contact_email: 'solo@example.com',
        contact_phone: '+91 9876543213',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should accept num_adults = 20 (maximum)', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 20,
        estimated_price: 45000,
        contact_name: 'Big Group',
        contact_email: 'biggroup@example.com',
        contact_phone: '+91 9876543214',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('TC-VALIDATION-004: Number of Children - Limits', () => {
    it('should reject num_children = -1', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 2,
        num_children: -1,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Number of children must be between 0 and 10');
    });

    it('should reject num_children = 15 (> 10)', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 2,
        num_children: 15,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should accept num_children = 0', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 2,
        num_children: 0,
        estimated_price: 45000,
        contact_name: 'No Kids',
        contact_email: 'nokids@example.com',
        contact_phone: '+91 9876543215',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should accept num_children = 10 (maximum)', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 2,
        num_children: 10,
        estimated_price: 45000,
        contact_name: 'Many Kids',
        contact_email: 'manykids@example.com',
        contact_phone: '+91 9876543216',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('TC-VALIDATION-005: Tour Not Found', () => {
    it('should reject booking with non-existent tour_id', async () => {
      const bookingData = {
        tour_id: 99999,
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 2,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Tour not found');
    });
  });

  describe('TC-VALIDATION-006: Tier Invalid for Tour', () => {
    it('should reject booking with tier not belonging to tour', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: 99999,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 2,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Package tier not found for this tour');
    });
  });

  describe('TC-VALIDATION-007: Missing Required Fields', () => {
    it('should reject booking without tour_id', async () => {
      const bookingData = {
        tier_id: testTier.id,
        travel_date: global.testUtils.generateValidTravelDate(),
        num_adults: 2,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should reject booking without travel_date', async () => {
      const bookingData = {
        tour_id: testTour.id,
        tier_id: testTier.id,
        num_adults: 2,
        estimated_price: 45000,
        contact_name: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+91 9876543210',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('TC-VALIDATION-010: Prevent Cancellation of Completed Trip', () => {
    it('should reject cancellation of Trip Completed status', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Trip Completed',
      });

      const response = await request(app)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cannot cancel a completed trip');

      // Verify status unchanged
      const updatedBooking = await dbHelper.getBookingById(booking.id);
      expect(updatedBooking.status).toBe('Trip Completed');
    });
  });

  describe('TC-VALIDATION-011: Prevent Double Cancellation', () => {
    it('should reject second cancellation attempt', async () => {
      const booking = await dbHelper.createTestBooking({
        user_id: testUsers.normalUser.id,
        tour_id: testTour.id,
        tier_id: testTier.id,
        status: 'Cancelled',
      });

      const response = await request(app)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Booking is already cancelled');
    });
  });
});
