import React from "react";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import auth from "./auth";

// Mock axios
jest.mock("axios");

// focus on observable behavior

// Fake localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("Auth Context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

// Verify if authentication state is correctly updated after setAuth is called (state based testing)
  it("auth state should update correctly after setAuth is called", () => {
    const testToken = "testToken";
    axios.defaults.headers.common["Authorization"] = testToken;
    const testUser = { name: "Test User", email: "test@gmail.com" };
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current).toEqual({ user: testUser, token: testToken });
  });
    
// System should allow user to access if authenticated

// System should not allow user to access if not authenticated
});