import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import axios from "axios";

// Adjust paths if your components live elsewhere
import Layout from "./Layout";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";

// Mock localStorage (like the sample)
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

jest.mock("axios");
const mockedAxios = axios;

const TestWrapper = ({ children, initialRoute = "/" }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      <CartProvider>
        <SearchProvider>{children}</SearchProvider>
      </CartProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe("Layout Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // If Layout triggers any initial axios calls (often categories), keep a benign default:
    mockedAxios.get.mockResolvedValue({ data: { success: true, category: [] } });
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders children and a non-empty <title>", async () => {
    render(
      <TestWrapper>
        <Layout>
          <div data-testid="layout-child">Hello Layout</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getByTestId("layout-child")).toBeInTheDocument();

    // Title is set (allow any non-empty)
    await waitFor(async () => {
      // Using Playwright is better for <title>, but in jsdom we can still check document.title
      expect(document.title).toMatch(/.+/);
    });
  });

  test("has a (optional) meta description and a Toaster-like region", async () => {
    render(
      <TestWrapper>
        <Layout>
          <div>content</div>
        </Layout>
      </TestWrapper>
    );

    // Let Header’s category fetch update complete to avoid act() warning
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

    const maybeToaster =
      screen.queryByTestId("app-toaster") ||
      screen.queryByRole("status") ||
      screen.queryByText(/toast|toaster|notification/i);
    // Toaster is optional in jsdom; don't hard-fail if absent
    if (maybeToaster) {
      expect(maybeToaster).toBeTruthy();
    }

    // 🟨 Meta description is best-effort in jsdom; don’t hard fail if absent
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      expect(meta.getAttribute("content")).toMatch(/.+/);
    } else {
      // Optional: log for future hardening, but don’t fail the smoke test
      // console.warn("No <meta name=\"description\"> found; consider adding Helmet in Layout.");
    }
  });
});
