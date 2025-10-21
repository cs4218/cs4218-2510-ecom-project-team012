export default {
  // name displayed during tests
  displayName: "frontend-integration",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  // testEnvironment: "node",
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  testMatch: [
    "<rootDir>/client/src/**/*.integration.test.js", // recursively match all test.js files under src
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/pages/**/*.js",
    "client/src/components/*.js",
    "client/src/hooks/*.js",
    "client/src/components/Form/CategoryForm.js",
    "client/src/components/Routes/Private.js",
    "client/src/context/cart.js",
    "client/src/context/auth.js",
  ],

  coverageThreshold: {
    global: {
      lines: 0,
      functions: 0,
    },
  },
  coveragePathIgnorePatterns: ["/node_modules/", ".test.js", ".spec.js"],
  testPathIgnorePatterns: ["/node_modules/", "\\.spec\\.js$"],
  coverageDirectory: "<rootDir>/coverage/frontend-integration-tests",
  passWithNoTests: true,
  setupFilesAfterEnv: ["<rootDir>/client/src/setupIntegrationTests.js"],
};
