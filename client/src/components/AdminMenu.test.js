import React from"react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import AdminMenu from "./AdminMenu";

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

describe("Admin Menu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render admin menu", () => {
    const { getByText } = render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(getByText("Admin Panel")).toBeInTheDocument();
    expect(getByText("Create Category")).toBeInTheDocument();
    expect(getByText("Create Product")).toBeInTheDocument();
    expect(getByText("Products")).toBeInTheDocument();
    expect(getByText("Orders")).toBeInTheDocument();
  });

  it("should have correct links", () => {
    const { getByText } = render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(getByText("Create Category")).toHaveAttribute("href", "/dashboard/admin/create-category");
    expect(getByText("Create Product")).toHaveAttribute("href", "/dashboard/admin/create-product");
    expect(getByText("Products")).toHaveAttribute("href", "/dashboard/admin/products");
    expect(getByText("Orders")).toHaveAttribute("href", "/dashboard/admin/orders");
  })

});