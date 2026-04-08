/**
 * Test Data Setup
 * Creates test users in the database for integration tests
 */

const db = require('../../src/db');
const { testUsers } = require('./authHelper');

/**
 * Create test users in the database
 */
const createTestUsers = async () => {
  try {
    // Create admin user (fixed: password instead of password_hash, handle both id and email conflicts)
    await db.query(`
      INSERT INTO users (id, full_name, email, password, role, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_verified = EXCLUDED.is_verified
    `, [
      testUsers.admin.id,
      testUsers.admin.full_name,
      testUsers.admin.email,
      '$2a$10$dummyhash', // Dummy bcrypt hash
      'admin',
      true
    ]);

    // Create normal user
    await db.query(`
      INSERT INTO users (id, full_name, email, password, role, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_verified = EXCLUDED.is_verified
    `, [
      testUsers.normalUser.id,
      testUsers.normalUser.full_name,
      testUsers.normalUser.email,
      '$2a$10$dummyhash',
      'client',
      true
    ]);

    // Create another user
    await db.query(`
      INSERT INTO users (id, full_name, email, password, role, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_verified = EXCLUDED.is_verified
    `, [
      testUsers.anotherUser.id,
      testUsers.anotherUser.full_name,
      testUsers.anotherUser.email,
      '$2a$10$dummyhash',
      'client',
      true
    ]);

    console.log('✅ Test users created successfully');
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  }
};

/**
 * Clean up test users
 */
const cleanupTestUsers = async () => {
  try {
    await db.query(`
      DELETE FROM users WHERE id IN ($1, $2, $3)
    `, [testUsers.admin.id, testUsers.normalUser.id, testUsers.anotherUser.id]);

    console.log('✅ Test users cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test users:', error);
  }
};

module.exports = {
  createTestUsers,
  cleanupTestUsers,
};
