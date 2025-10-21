import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import axios from "axios";

import Header from "./Header";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";

// Mock localStorage
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

// --- Silence React key warnings only ---
let consoleErrorSpy;
beforeAll(() => {
  consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation((msg, ...args) => {
      if (
        typeof msg === "string" &&
        msg.includes('unique "key" prop')
      )
        return; // ignore only key warnings
    });
});
afterAll(() => {
  consoleErrorSpy?.mockRestore();
});
// ---------------------------------------

describe("Header Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        category: [
          { _id: "1", name: "Electronics", slug: "electronics" },
          { _id: "2", name: "Clothing", slug: "clothing" },
        ],
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("shows authenticated user & dashboard; hides login/register", async () => {
    localStorage.setItem(
      "auth",
      JSON.stringify({ user: { name: "John Doe", role: 0 }, token: "tok" })
    );

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /dashboard/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("link", { name: /login/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /register/i })
    ).not.toBeInTheDocument();
  });

  test("guest sees login/register", async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /login/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /register/i })
      ).toBeInTheDocument();
    });

    expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
  });

  test("logout clears auth and shows guest links", async () => {
    localStorage.setItem(
      "auth",
      JSON.stringify({ user: { name: "John Doe", role: 0 }, token: "tok" })
    );

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    const logout = screen.getByRole("link", { name: /logout/i });
    fireEvent.click(logout);

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /login/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /register/i })
      ).toBeInTheDocument();
    });
    expect(localStorage.getItem("auth")).toBeNull();
  });

  test("admin sees admin dashboard link", async () => {
    localStorage.setItem(
      "auth",
      JSON.stringify({ user: { name: "Admin", role: 1 }, token: "tok" })
    );

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    await waitFor(() => {
      const dash = screen.getByRole("link", { name: /dashboard/i });
      expect(dash).toHaveAttribute("href", "/dashboard/admin");
    });
  });

  test("loads & renders categories; handles API error gracefully", async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/api/v1/category/get-category"
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /electronics/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /clothing/i })
      ).toBeInTheDocument();
    });

    // Trigger error path
    mockedAxios.get.mockRejectedValueOnce(new Error("fail"));
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    // Scoped check: first navbar only to avoid multiple "Categories" links
    const navbars = screen.getAllByRole("navigation");
    const navbar = navbars[0];
    expect(
      within(navbar).getByRole("link", { name: /^categories$/i })
    ).toBeInTheDocument();
  });
});
