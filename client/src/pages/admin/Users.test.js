import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Users from "./Users";

// Mock dependencies
jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

// Mock window.matchMedia for antd components
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("Users Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Users component", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "All Users" })).toBeInTheDocument();
  });

  it("displays 'All Users' heading", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "All Users" })).toBeInTheDocument();
  });

  it("renders AdminMenu component", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("renders Admin Panel heading", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Admin Panel" })).toBeInTheDocument();
  });
});