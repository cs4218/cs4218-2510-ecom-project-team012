export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: [
    "<rootDir>/controllers/*.test.js",
    "<rootDir>/controllers/auth/*.test.js",
    "<rootDir>/controllers/order/*.test.js",
    "<rootDir>/models/*.test.js",
    "<rootDir>/middlewares/*.test.js",
    "<rootDir>/helpers/*.test.js",
    "<rootDir>/config/*.test.js",
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/productController.js",
    "models/productModel.js",
    "models/userModel.js",
  ],

  coverageThreshold: {
    global: {
      lines: 10,
      functions: 10,
    },
  },

  setupFilesAfterEnv: ["<rootDir>/jest.backend.setup.js"],
  coverageDirectory: "<rootDir>/coverage/back-tests",
};
