import React from "react";
import { render, within } from "@testing-library/react";
import Dashboard from "../../pages/user/Dashboard";
import { useAuth } from "../../context/auth";

// General structure generated with the help of AI

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

jest.mock("../../components/UserMenu", () => () => (
  <div data-testid="user-menu">UserMenu</div>
));

describe("Dashboard Component", () => {
  let consoleErrorSpy, consoleWarnSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should not crash and renders safely when user is not authenticated", () => {
    useAuth.mockReturnValue([{}]); // no user info

    const { getByText, getByTestId, queryByText } = render(<Dashboard />);

    // Title should still render
    expect(getByText("Dashboard - Ecommerce App")).toBeInTheDocument();

    // No user profile info should be rendered
    expect(queryByText(/@/i)).not.toBeInTheDocument();

    // UserMenu should still rendered
    expect(getByTestId("user-menu")).toBeInTheDocument();

    // No console errors/warnings
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it("should render dashboard title, user info, and menu when user is authenticated", () => {
    const mockUser = {
      name: "John Doe",
      email: "john@example.com",
      address: "123 Test Street",
    };
    useAuth.mockReturnValue([{ user: mockUser }]);

    const { getByText, getByTestId } = render(<Dashboard />);

    // Title heading
    expect(getByText("Dashboard - Ecommerce App")).toBeInTheDocument();

    // User profile info
    expect(getByText("John Doe")).toBeInTheDocument();
    expect(getByText("john@example.com")).toBeInTheDocument();
    expect(getByText("123 Test Street")).toBeInTheDocument();

    // UserMenu should render
    expect(getByTestId("user-menu")).toBeInTheDocument();
  });
});
