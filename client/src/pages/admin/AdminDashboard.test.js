import React from "react";
import Layout from "./../../components/Layout";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import AdminDashboard from "./AdminDashboard";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require("../../context/auth");

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

describe("AdminDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render AdminDashboard page if admin is logged in", () => {
    useAuth.mockReturnValue([
      {
        user: {
          name: "Admin User",
          email: "admin@example.com",
          phone: "123-456-7890",
        },
      },
      jest.fn(),
    ]);

    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByTestId("admin-menu")).toBeInTheDocument();
    expect(getByText(/Admin Name : /i)).toHaveTextContent("Admin User");
    expect(getByText(/Admin Email : /i)).toHaveTextContent("admin@example.com");
    expect(getByText(/Admin Contact : /i)).toHaveTextContent("123-456-7890");
  });

  it("should not render admin info if admin is not logged in", () => {
    const { queryByText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    useAuth.mockReturnValue([null, jest.fn()]);

    expect(queryByText("Admin Name : ")).not.toBeInTheDocument();
    expect(queryByText("Admin Email : ")).not.toBeInTheDocument();
    expect(queryByText("Admin Contact : ")).not.toBeInTheDocument();
  });
});