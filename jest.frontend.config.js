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
    "<rootDir>/client/frontend-auth.test.js",
    "<rootDir>/client/src/**/*.test.js", // recursively match all test.js files under src
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
    "!**/*.spec.js",
  ],

  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/client/src/setupTests.js"],
  coverageDirectory: "<rootDir>/coverage/front-tests",


  // ignore integration tests
  coveragePathIgnorePatterns: [
    "/node_modules/",
    ".integration.test.js",
    "\\.spec\\.js$",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "\\.integration\\.test\\.js$",
    "\\.spec\\.js$",
  ],
};
