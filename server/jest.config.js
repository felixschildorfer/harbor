export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    '!**/*.test.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/?(*.)+(spec|test).js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
