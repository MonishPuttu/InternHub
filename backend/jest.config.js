export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["<rootDir>/Tests/Integration/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/db/schema/**", "!src/server.js"],
  coverageDirectory: "<rootDir>/Tests/coverage",
  verbose: true,
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/Tests/setup/jest.setup.js"],
  forceExit: true,
  clearMocks: true,
};
