import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Policy from "./Policy";

// Mock the Layout component
jest.mock("../components/Layout", () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout">
        <div data-testid="layout-title">{title}</div>
        {children}
      </div>
    );
  };
});

// Mock hooks used by Header component
jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
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

describe("Policy Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Policy component with correct title", () => {
    render(
      <MemoryRouter>
        <Policy />
      </MemoryRouter>
    );
    const layoutTitle = screen.getByTestId("layout-title");
    expect(layoutTitle).toHaveTextContent("Privacy Policy");
  });

  it("renders the contact us image with correct attributes", () => {
    render(
      <MemoryRouter>
        <Policy />
      </MemoryRouter>
    );
    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
    expect(image).toHaveStyle({ width: "100%" });
  });

  it("renders all privacy policy text paragraphs", () => {
    render(
      <MemoryRouter>
        <Policy />
      </MemoryRouter>
    );
    const paragraphs = screen.getAllByText("add privacy policy");
    expect(paragraphs).toHaveLength(7);
  });
});

