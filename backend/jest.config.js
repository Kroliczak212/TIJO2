module.exports = {
  testEnvironment: 'node',
  verbose: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/*.test.js'],
  setupFilesAfterEnv: ['./src/tests/setup.js']
};
