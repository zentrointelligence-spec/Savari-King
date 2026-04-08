/**
 * Database Helper for Tests
 * Provides utilities for database operations in tests
 */

const db = require('../../src/db');

/**
 * Create a test tour
 */
const createTestTour = async () => {
  const result = await db.query(`
    INSERT INTO tours (
      name, destinations, duration_days, main_image_url,
      short_description, is_featured, is_active
    ) VALUES (
      'Test Kerala Tour', ARRAY['Kerala'], 5, 'https://example.com/image.jpg',
      'A beautiful test tour', true, true
    ) RETURNING *
  `);
  return result.rows[0];
};

/**
 * Create a test package tier
 */
const createTestTier = async (tourId) => {
  const result = await db.query(`
    INSERT INTO packagetiers (
      tour_id, tier_name, price, hotel_type,
      inclusions_summary, exclusions_summary
    ) VALUES (
      $1, 'Standard', 45000, '3 Star',
      ARRAY['Accommodation', 'Meals'], ARRAY['Flights']
    ) RETURNING *
  `, [tourId]);
  return result.rows[0];
};

/**
 * Create a test user
 */
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    full_name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password_hash: '$2a$10$dummyhash', // Dummy bcrypt hash
    is_admin: false,
  };

  const user = { ...defaultUser, ...userData };

  const result = await db.query(`
    INSERT INTO users (full_name, email, password_hash, is_admin)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [user.full_name, user.email, user.password_hash, user.is_admin]);

  return result.rows[0];
};

/**
 * Create a test booking
 */
const createTestBooking = async (data = {}) => {
  const defaultData = {
    user_id: data.user_id || 1,
    tour_id: data.tour_id || 1,
    tier_id: data.tier_id || 1,
    travel_date: data.travel_date || global.testUtils.generateValidTravelDate(),
    num_adults: data.num_adults || 2,
    num_children: data.num_children || 0,
    selected_addons: data.selected_addons || [],
    selected_vehicles: data.selected_vehicles || [],
    estimated_price: data.estimated_price || 45000,
    currency: data.currency || 'INR',
    status: data.status || 'Inquiry Pending',
    contact_name: data.contact_name || 'John Doe',
    contact_email: data.contact_email || 'john@example.com',
    contact_phone: data.contact_phone || '+91 9876543210',
    special_requests: data.special_requests || null,
  };

  const result = await db.query(`
    INSERT INTO bookings (
      user_id, tour_id, tier_id, travel_date,
      num_adults, num_children, selected_addons, selected_vehicles,
      estimated_price, currency, status,
      contact_name, contact_email, contact_phone, special_requests
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `, [
    defaultData.user_id,
    defaultData.tour_id,
    defaultData.tier_id,
    defaultData.travel_date,
    defaultData.num_adults,
    defaultData.num_children,
    JSON.stringify(defaultData.selected_addons),
    JSON.stringify(defaultData.selected_vehicles),
    defaultData.estimated_price,
    defaultData.currency,
    defaultData.status,
    defaultData.contact_name,
    defaultData.contact_email,
    defaultData.contact_phone,
    defaultData.special_requests,
  ]);

  return result.rows[0];
};

/**
 * Clean up test data
 */
const cleanupTestData = async () => {
  // Delete in correct order to respect foreign keys
  await db.query('DELETE FROM bookings WHERE contact_email LIKE \'%@example.com\' OR contact_email LIKE \'%@test.com\'');
  await db.query('DELETE FROM packagetiers WHERE tier_name LIKE \'%Test%\' OR tier_name = \'Standard\'');
  await db.query('DELETE FROM tours WHERE name LIKE \'%Test%\'');
  await db.query('DELETE FROM users WHERE email LIKE \'%@example.com\' AND id > 10'); // Keep admin users
};

/**
 * Get booking by ID
 */
const getBookingById = async (id) => {
  const result = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
  return result.rows[0];
};

/**
 * Update booking status
 */
const updateBookingStatus = async (id, status, additionalData = {}) => {
  const updates = { status, ...additionalData };
  const setClauses = Object.keys(updates).map((key, idx) => `${key} = $${idx + 2}`).join(', ');
  const values = [id, ...Object.values(updates)];

  const result = await db.query(`
    UPDATE bookings SET ${setClauses} WHERE id = $1 RETURNING *
  `, values);

  return result.rows[0];
};

/**
 * Set payment timestamp for a booking (for testing cancellation window)
 */
const setPaymentTimestamp = async (bookingId, hoursAgo) => {
  const result = await db.query(`
    UPDATE bookings
    SET payment_timestamp = NOW() - INTERVAL '${hoursAgo} hours',
        status = 'Payment Confirmed'
    WHERE id = $1
    RETURNING *
  `, [bookingId]);
  return result.rows[0];
};

/**
 * Set quote expiration for a booking
 */
const setQuoteExpiration = async (bookingId, hoursFromNow) => {
  const result = await db.query(`
    UPDATE bookings
    SET quote_expiration_date = NOW() + INTERVAL '${hoursFromNow} hours',
        status = 'Quote Sent',
        quote_sent_date = NOW()
    WHERE id = $1
    RETURNING *
  `, [bookingId]);
  return result.rows[0];
};

module.exports = {
  createTestTour,
  createTestTier,
  createTestUser,
  createTestBooking,
  cleanupTestData,
  getBookingById,
  updateBookingStatus,
  setPaymentTimestamp,
  setQuoteExpiration,
};
