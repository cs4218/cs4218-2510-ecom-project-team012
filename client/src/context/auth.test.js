import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import { renderHook } from "@testing-library/react";
import { useAuth, AuthProvider } from "./auth";

// Mock axios
jest.mock("axios");

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

  // Verify if default auth state is null user and empty token
  it("default auth state should be null user and empty token", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current[0]).toEqual({ user: null, token: "" });
  });

  // Verify if authentication state is correctly updated when mounted
  it("auth state should update if auth exists", () => {
    const testData = { user: "Test User", token: "testToken" };
    localStorage.getItem.mockReturnValue(JSON.stringify(testData));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current[0]).toEqual(testData);
  });
    
// System should allow user to access if authenticated

// System should not allow user to access if not authenticated
});