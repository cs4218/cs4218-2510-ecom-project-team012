export default {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
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
    // "<rootDir>/client/src/**/*.test.js", // recursively match all test.js files under src
    "<rootDir>/client/src/pages/CartPage.test.js",
    "<rootDir>/client/src/pages/CategoryProduct.test.js",
    "<rootDir>/client/src/pages/ProductDetails.test.js",
    "<rootDir>/client/src/pages/user/Dashboard.test.js",
    "<rootDir>/client/src/components/Routes/Private.test.js",
    "<rootDir>/client/src/components/UserMenu.test.js",
    "<rootDir>/client/src/context/cart.test.js",
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/pages/CartPage.js",
    "client/src/pages/CategoryProduct.js",
    "client/src/pages/ProductDetails.js",
    "client/src/pages/user/Dashboard.js",
    "client/src/components/Routes/Private.js",
    "client/src/components/UserMenu.js",
    "client/src/context/cart.js",
  ],

  coverageThreshold: {
    global: {
      lines: 50,
      functions: 50,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/client/src/setupTests.js"],
  coverageDirectory: "<rootDir>/coverage/front-tests",
};
