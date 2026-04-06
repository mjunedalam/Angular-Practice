module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|d3|d3-.*|internmap|delaunator|robust-predicates)'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
