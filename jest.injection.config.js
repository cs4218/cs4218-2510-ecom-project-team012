export default {
  displayName: "injection-tests",
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: [
    "<rootDir>/tests/injection_tests/**/*.test.js",
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**",
    "models/**",
    "middlewares/**",
    "config/**",
  ],
  coverageThreshold: {
    global: {
      lines: 0,
      functions: 0,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/setupBackendIntegrationTests.js"],
  coveragePathIgnorePatterns: ["/node_modules/", ".test.js"],
  coverageDirectory: "<rootDir>/coverage/injection-tests",
};
