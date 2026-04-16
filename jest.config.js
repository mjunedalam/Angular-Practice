module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|d3|d3-.*|internmap|delaunator|robust-predicates)'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
    '^@models/(.*)$': '<rootDir>/src/app/core/models/$1',
    '^@store/(.*)$': '<rootDir>/src/app/core/store/$1',
    '^@services/(.*)$': '<rootDir>/src/app/core/services/$1',
    '^@guards/(.*)$': '<rootDir>/src/app/core/guards/$1',
    '^@interceptors/(.*)$': '<rootDir>/src/app/core/interceptors/$1',
  },
};
