const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);



