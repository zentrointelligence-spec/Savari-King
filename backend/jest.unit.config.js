module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns - only unit tests
  testMatch: [
    '**/tests/services/destinationService.unit.test.js'
  ],

  // NO SETUP FILE - Pure unit tests with mocks
  // setupFilesAfterEnv: [],

  // Module paths
  moduleDirectories: ['node_modules', 'src'],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 10000,

  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Module name mapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ]
};
