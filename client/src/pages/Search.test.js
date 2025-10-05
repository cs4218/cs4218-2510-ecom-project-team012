import React from "react";
import { render, screen } from "@testing-library/react";

// Mock dependencies
jest.mock("../context/search", () => ({
  useSearch: jest.fn(),
}));
jest.mock("../components/Layout", () => ({ children, title }) => (
  <div data-testid="layout" data-title={title}>
    {children}
  </div>
));

import Search from "./Search";
import { useSearch } from "../context/search";

describe("Search Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display 'No Products Found' when results are empty", () => {
    useSearch.mockReturnValue([{ keyword: "", results: [] }, jest.fn()]);
    render(<Search />);

    expect(screen.getByText("Search Resuts")).toBeInTheDocument();
    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  it("should display product count and render multiple product cards", () => {
    const mockResults = [
      {
        _id: "1",
        name: "Laptop",
        description: "This is a great laptop for everyday use",
        price: 500,
      },
      {
        _id: "2",
        name: "Phone",
        description: "A smartphone with excellent features",
        price: 300,
      },
    ];
    useSearch.mockReturnValue([{ keyword: "laptop", results: mockResults }, jest.fn()]);
    render(<Search />);

    expect(screen.getByText("Found 2")).toBeInTheDocument();
    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
  });

  it("should display product details with truncated description", () => {
    const mockResults = [
      {
        _id: "abc123",
        name: "Gaming Laptop",
        description: "High-performance gaming laptop with RTX graphics",
        price: 1500,
      },
    ];
    useSearch.mockReturnValue([{ keyword: "gaming", results: mockResults }, jest.fn()]);
    render(<Search />);

    expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
    expect(screen.getByText("High-performance gaming laptop...")).toBeInTheDocument();
    expect(screen.getByText("$ 1500")).toBeInTheDocument();
    
    const image = screen.getByAltText("Gaming Laptop");
    expect(image).toHaveAttribute("src", "/api/v1/product/product-photo/abc123");
  });

  it("should render action buttons for products", () => {
    const mockResults = [
      {
        _id: "1",
        name: "Product",
        description: "Description",
        price: 100,
      },
    ];
    useSearch.mockReturnValue([{ keyword: "test", results: mockResults }, jest.fn()]);
    render(<Search />);

    expect(screen.getByText("More Details")).toBeInTheDocument();
    expect(screen.getByText("ADD TO CART")).toBeInTheDocument();
  });
});

