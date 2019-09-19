module.exports = {
  setupFilesAfterEnv: ['<rootDir>/lib/setup-tests.ts'],
  testEnvironment: 'node',
  modulePaths: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testMatch: ['<rootDir>/__tests__/**/*.ts']
};
