/**
 * Jest Test Setup File
 * Runs before all tests
 */

// Load environment variables FIRST
require('dotenv').config();

const { createTestUsers } = require('./helpers/testDataSetup');

// Set test environment variables (override after dotenv loads)
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.ADMIN_EMAIL = 'admin@test.com';
process.env.SUPPORT_EMAIL = 'support@test.com';
process.env.SUPPORT_PHONE = '+91 9876543210';

// Increase timeout for integration tests
jest.setTimeout(15000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(), // Silence console.log
  error: jest.fn(), // Keep errors visible but mocked for assertions
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Global test utilities
global.testUtils = {
  generateValidTravelDate: () => {
    const date = new Date();
    date.setDate(date.getDate() + 6); // 6 days from now (min is 5)
    return date.toISOString().split('T')[0];
  },

  generateInvalidTravelDate: () => {
    const date = new Date();
    date.setDate(date.getDate() + 2); // Only 2 days (less than 5)
    return date.toISOString().split('T')[0];
  },

  generateBookingReference: () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999999 + 1).toString().padStart(6, '0');
    return `EB-${year}-${random}`;
  }
};

// Create test users before all tests
beforeAll(async () => {
  await createTestUsers();
});

console.log('✅ Test environment initialized');
