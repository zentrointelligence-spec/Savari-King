/**
 * Authentication Helper for Tests
 * Generates JWT tokens for test users
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';

/**
 * Test User Profiles
 */
const testUsers = {
  admin: {
    id: 1,
    email: 'admin@test.com',
    full_name: 'Test Admin',
    role: 'admin',
    is_admin: true,
  },
  normalUser: {
    id: 2,
    email: 'user@test.com',
    full_name: 'Test User',
    role: 'user',
    is_admin: false,
  },
  anotherUser: {
    id: 3,
    email: 'another@test.com',
    full_name: 'Another User',
    role: 'user',
    is_admin: false,
  },
};

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @param {String} expiresIn - Token expiration (default: 7d)
 * @returns {String} JWT token
 */
const generateToken = (user, expiresIn = '7d') => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin || false,
    },
    JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Generate an expired token
 */
const generateExpiredToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin || false,
    },
    JWT_SECRET,
    { expiresIn: '-1h' } // Expired 1 hour ago
  );
};

/**
 * Generate an invalid token (wrong signature)
 */
const generateInvalidToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin || false,
    },
    'wrong-secret-key', // Wrong secret
    { expiresIn: '7d' }
  );
};

/**
 * Get admin token
 */
const getAdminToken = () => {
  return generateToken(testUsers.admin);
};

/**
 * Get normal user token
 */
const getUserToken = () => {
  return generateToken(testUsers.normalUser);
};

/**
 * Get another user token (for isolation tests)
 */
const getAnotherUserToken = () => {
  return generateToken(testUsers.anotherUser);
};

module.exports = {
  testUsers,
  generateToken,
  generateExpiredToken,
  generateInvalidToken,
  getAdminToken,
  getUserToken,
  getAnotherUserToken,
};
