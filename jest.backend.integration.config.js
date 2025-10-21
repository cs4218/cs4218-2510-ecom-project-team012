export default {
  // display name
  displayName: "backend-integration",

  // when testing backend
  testEnvironment: "node",

  // transform js files with babel-jest
  transform: {
    "^.+\\.js$": "babel-jest",
  },

  // which test to run
  testMatch: [
    "<rootDir>/models/*.integration.test.js",
    "<rootDir>/controllers/*.integration.test.js",
    "<rootDir>/controllers/order/*.integration.test.js",
    "<rootDir>/controllers/auth/*.integration.test.js",
    "<rootDir>/helpers/*.integration.test.js",
    "<rootDir>/middlewares/*.integration.test.js",
    "<rootDir>/config/*.integration.test.js",

  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**",
    "models/**",
    "middlewares/**",
    "helpers/**",
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

  coverageDirectory: "<rootDir>/coverage/backend-integration-tests",
};
