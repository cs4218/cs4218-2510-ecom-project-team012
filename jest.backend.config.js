export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/controllers/*.test.js", "<rootDir>/middlewares/*.test.js", "<rootDir>/helpers/*.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**"],
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
    },
  },
};
