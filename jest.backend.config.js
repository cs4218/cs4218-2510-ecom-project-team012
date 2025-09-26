export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/controllers/*.test.js", "<rootDir>/middlewares/*.test.js", "<rootDir>/helpers/*.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**", "middlewares/**", "helpers/**"],
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
    },
  },

  "setupFilesAfterEnv": ["<rootDir>/jest.backend.setup.js"]
};
