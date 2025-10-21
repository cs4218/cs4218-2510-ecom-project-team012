import React from "react";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Mock router hooks properly (don’t spyOn ESM exports)
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),   // we'll set its return per test
    useLocation: jest.fn(),   // provide a fake location for redirects that read it
  };
});
import * as rrd from "react-router-dom";

import Spinner from "./Spinner";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";

jest.useFakeTimers();

const navigateMock = jest.fn();

// Mock localStorage like the sample you shared
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

const TestWrapper = ({ children, initialRoute = "/" }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      <CartProvider>
        <SearchProvider>{children}</SearchProvider>
      </CartProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe("Spinner Integration Tests (guard/redirect)", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // mocked hooks return our fakes each test
    rrd.useNavigate.mockReturnValue(navigateMock);
    rrd.useLocation.mockReturnValue({ pathname: "/dashboard/user" });
  });

  test("shows spinner and redirects to default 'login' after 3s countdown", () => {
    render(
      <TestWrapper initialRoute="/dashboard/user">
        <Spinner />
      </TestWrapper>
    );

    // Spinner UI (add data-testid="guard-spinner" in Spinner.js to make this stronger)
    const spinner =
      screen.queryByTestId("guard-spinner") ||
      screen.queryByText(/redirecting/i) ||
      screen.queryByText(/please login/i) ||
      screen.queryByText(/seconds/i);
    expect(spinner).toBeTruthy();

    // Advance in 1s ticks so interval-driven state updates run
    act(() => { jest.advanceTimersByTime(1000); });
    act(() => { jest.advanceTimersByTime(1000); });
    act(() => { jest.advanceTimersByTime(1000); });

    expect(navigateMock).toHaveBeenCalled();
    expect(String(navigateMock.mock.calls[0][0])).toMatch(/login|signin/i);
  });

  test("respects custom redirect path (e.g., 'register')", () => {
    render(
      <TestWrapper initialRoute="/dashboard/user">
        <Spinner path="register" />
      </TestWrapper>
    );

    expect(
      screen.queryByTestId("guard-spinner") ||
      screen.queryByText(/redirecting/i) ||
      screen.queryByText(/seconds/i)
    ).toBeTruthy();

    act(() => { jest.advanceTimersByTime(1000); });
    act(() => { jest.advanceTimersByTime(1000); });
    act(() => { jest.advanceTimersByTime(1000); });

    expect(navigateMock).toHaveBeenCalled();
    expect(String(navigateMock.mock.calls[0][0])).toMatch(/register/i);
  });
});
