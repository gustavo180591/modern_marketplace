module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/backend/src/**/*.test.js',
    '<rootDir>/frontend/src/**/*.test.js',
    '<rootDir>/frontend/src/**/*.test.jsx'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'backend/src/**/*.js',
    'frontend/src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Module name mapping for absolute imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/frontend/src/$1',
    '^@components/(.*)$': '<rootDir>/frontend/src/components/$1',
    '^@pages/(.*)$': '<rootDir>/frontend/src/pages/$1',
    '^@hooks/(.*)$': '<rootDir>/frontend/src/hooks/$1',
    '^@contexts/(.*)$': '<rootDir>/frontend/src/contexts/$1',
    '^@utils/(.*)$': '<rootDir>/frontend/src/utils/$1',
    '^@assets/(.*)$': '<rootDir>/frontend/src/assets/$1'
  },
  
  // Ignore patterns
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    'build/'
  ],
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Test timeout
  testTimeout: 10000
};
