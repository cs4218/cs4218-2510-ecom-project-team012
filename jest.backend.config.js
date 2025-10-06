export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // transform js files with babel-jest
  transform: {
    "^.+\\.js$": "babel-jest",
  },

  // which test to run
  testMatch: [
  "<rootDir>/controllers/*.test.js",
  "<rootDir>/controllers/auth/*.test.js",
  "<rootDir>/controllers/order/*.test.js",
  "<rootDir>/models/*.test.js",
  "<rootDir>/middlewares/*.test.js",
  "<rootDir>/helpers/*.test.js",
  "<rootDir>/config/*.test.js"
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**",
    "models/**",
    "middlewares/**",
    "helpers/**",
    "config/**"
  ],
    
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },

  "setupFilesAfterEnv": ["<rootDir>/jest.backend.setup.js"],
  coverageDirectory: "<rootDir>/coverage/back-tests",
};
