import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import PrivateRoute from "./Private";
import axios from "axios";
import { useAuth } from "../../context/auth";

// General structure generated with the help of AI

jest.mock("axios");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet" />,
}));
jest.mock("../Spinner", () => (props) => <div data-testid="spinner" />);

describe("PrivateRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render Outlet when user is authenticated and API returns ok", async () => {
    // Arrange
    useAuth.mockReturnValue([{ token: "valid-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    // Act
    render(<PrivateRoute />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    // Not using the exact URL check as it may change in future
    // expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth");
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("should render Spinner and API is not called when user is not authenticated (user token is missing)", () => {
    // Arrange
    useAuth.mockReturnValue([{ token: null }, jest.fn()]);

    // Act
    render(<PrivateRoute />);

    // Assert
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("outlet")).not.toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("should render Spinner when API returns not ok when user is not authenticated (user token is invalid)", async () => {
    // Arrange
    useAuth.mockReturnValue([{ token: "invalid-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: false } });

    // Act
    render(<PrivateRoute />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("outlet")).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  // to ensure Spinner is shown while waiting for API response
  it("should render Spinner while auth check is pending", async () => {
    // Arrange
    useAuth.mockReturnValue([{ token: "valid-token" }, jest.fn()]);
    let resolve;
    axios.get.mockImplementation(() => new Promise((r) => (resolve = r)));

    // Act
    render(<PrivateRoute />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    // Assert
    resolve({ data: { ok: true } });
    await waitFor(() =>
      expect(screen.getByTestId("outlet")).toBeInTheDocument()
    );
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("should render Spinner if auth check API call fails", async () => {
    // Arrange
    useAuth.mockReturnValue([{ token: "valid-token" }, jest.fn()]);
    axios.get.mockRejectedValue(new Error("Network Error"));

    // Act
    render(<PrivateRoute />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("outlet")).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  // TODO: Not sure if need to add integration test to check if user gets redirected to login page after failed auth check
});
