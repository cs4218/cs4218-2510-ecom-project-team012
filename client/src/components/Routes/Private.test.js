import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import PrivateRoute from "./Private";
import axios from "axios";
import { useAuth } from "../../context/auth";

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

  it("renders Outlet when user is authenticated and API returns ok", async () => {
    useAuth.mockReturnValue([{ token: "valid-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(<PrivateRoute />);

    await waitFor(() => {
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    // Not using the exact URL check as it may change in future
    // expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth");
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("renders Spinner when user is not authenticated", () => {
    useAuth.mockReturnValue([{ token: null }, jest.fn()]);

    render(<PrivateRoute />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("outlet")).not.toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("renders Spinner when API returns not ok", async () => {
    useAuth.mockReturnValue([{ token: "invalid-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: false } });

    render(<PrivateRoute />);

    await waitFor(() => {
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("outlet")).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("shows Spinner while auth check is pending", async () => {
    useAuth.mockReturnValue([{ token: "valid-token" }, jest.fn()]);
    let resolve;
    axios.get.mockImplementation(() => new Promise((r) => (resolve = r)));

    render(<PrivateRoute />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    resolve({ data: { ok: true } });
    await waitFor(() =>
      expect(screen.getByTestId("outlet")).toBeInTheDocument()
    );
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  // TODO: Not sure if need to add test to check if user gets redirected to login page after failed auth check

});
