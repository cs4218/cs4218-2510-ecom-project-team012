export default {
  displayName: "braintree-security",
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: [
    "<rootDir>/tests/braintree-sercurity/**/*.test.js",
  ],
  coverageDirectory: "<rootDir>/coverage/braintree-security",
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/paymentController.js",
    "routes/paymentRoutes.js",
  ],
  testPathIgnorePatterns: ["/node_modules/"],
};
