import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Footer from "./Footer";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

const TestWrapper = ({ children }) => (
  <MemoryRouter>
    <AuthProvider>
      <CartProvider>
        <SearchProvider>{children}</SearchProvider>
      </CartProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe("Footer Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("is visible and has at least one link", () => {
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    // find heading then climb to its container
    const heading = screen.getByText(/all rights reserved/i);
    const container = heading.closest(".footer") || heading.parentElement;
    expect(container).toBeTruthy();

    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
  });

  test("first footer link is keyboard-focusable (a11y smoke)", () => {
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    const heading = screen.getByText(/all rights reserved/i);
    const container = heading.closest(".footer") || heading.parentElement;
    expect(container).toBeTruthy();

    const links = container.querySelectorAll("a");
    if (links.length) {
      links[0].focus();
      expect(document.activeElement).toBe(links[0]);
    }
  });
});
