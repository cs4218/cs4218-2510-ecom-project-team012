import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import axios from "axios";

import Orders from "./Orders";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";

jest.mock("axios");
const mockedAxios = axios;

const TestWrapper = ({ children, initialRoute = "/dashboard/user/orders" }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      <CartProvider>
        <SearchProvider>{children}</SearchProvider>
      </CartProvider>
    </AuthProvider>
  </MemoryRouter>
);

// react-hot-toast uses matchMedia in jsdom
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe("Orders Integration (Buyer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Logged-in buyer by default
    localStorage.setItem(
      "auth",
      JSON.stringify({
        user: { _id: "u1", name: "Buyer A", role: 0, email: "a@a.com" },
        token: "buyer-token",
      })
    );

    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: {
            success: true,
            category: [
              { _id: "c1", name: "Electronics", slug: "electronics" },
              { _id: "c2", name: "Clothing", slug: "clothing" },
            ],
          },
        });
      }
      if (url === "/api/v1/auth/orders") {
        return Promise.resolve({
          data: [
            {
              _id: "o1",
              status: "Not Process",
              buyer: { _id: "u1", name: "Buyer A" },
              createAt: new Date().toISOString(),
              payment: { success: true },
              products: [
                {
                  _id: "p1",
                  name: "Laptop",
                  description: "A good laptop",
                  price: 1200,
                },
              ],
            },
          ],
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders list scaffold and consumes API response", async () => {
    render(
      <TestWrapper>
        <Orders />
      </TestWrapper>
    );

    // Page heading
    expect(
      await screen.findByRole("heading", { name: /all orders/i })
    ).toBeInTheDocument();

    // At least one table
    const tables = await screen.findAllByRole("table");
    const table = tables[0];

    // <thead> and <tbody> both have role="rowgroup"
    const [, tbody] = within(table).getAllByRole("rowgroup");

    // Columns present
    expect(within(table).getByText(/status/i)).toBeInTheDocument();
    expect(within(table).getByText(/payment/i)).toBeInTheDocument();

    // Verify row cells
    const row = within(tbody).getAllByRole("row")[0];
    const cells = within(row).getAllByRole("cell");
    // 0:#, 1:Status, 2:Buyer, 3:date, 4:Payment, 5:Qty
    expect(cells[1]).toHaveTextContent(/not process/i);
    expect(cells[2]).toHaveTextContent(/buyer a/i);
    expect(cells[4]).toHaveTextContent(/success/i);
    expect(cells[5]).toHaveTextContent("1");

    // Product card
    expect(screen.getByText(/^laptop$/i)).toBeInTheDocument();
    expect(screen.getByAltText(/laptop/i)).toBeInTheDocument();
    expect(screen.getByText(/price\s*:?\s*1200/i)).toBeInTheDocument();
  });

  test("branch: failed payment and empty products", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: { success: true, category: [] } });
      }
      if (url === "/api/v1/auth/orders") {
        return Promise.resolve({
          data: [
            {
              _id: "o2",
              status: "Processing",
              buyer: { _id: "u2", name: "Buyer B" },
              createAt: new Date().toISOString(),
              payment: { success: false }, // cover "Failed"
              products: [], // cover empty map
            },
          ],
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <TestWrapper>
        <Orders />
      </TestWrapper>
    );

    const table = (await screen.findAllByRole("table"))[0];
    const [, tbody] = within(table).getAllByRole("rowgroup");
    const row = within(tbody).getAllByRole("row")[0];
    const cells = within(row).getAllByRole("cell");

    expect(cells[1]).toHaveTextContent(/processing/i);
    expect(cells[2]).toHaveTextContent(/buyer b/i);
    expect(cells[4]).toHaveTextContent(/failed/i);
    expect(cells[5]).toHaveTextContent("0");
    expect(screen.queryByAltText(/laptop/i)).toBeNull();
  });

  test("auth guard: does NOT fetch orders when not authenticated", async () => {
    localStorage.removeItem("auth");
    const spy = jest.spyOn(mockedAxios, "get");

    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: { success: true, category: [] } });
      }
      if (url === "/api/v1/auth/orders") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <TestWrapper>
        <Orders />
      </TestWrapper>
    );

    // Heading renders
    expect(
      await screen.findByRole("heading", { name: /all orders/i })
    ).toBeInTheDocument();

    // Ensure orders endpoint was not called (covers the guard)
    await waitFor(() => {
      expect(spy.mock.calls.find((c) => c[0] === "/api/v1/auth/orders")).toBeUndefined();
    });
    expect(screen.queryByRole("table")).toBeNull();
  });

  test("error path: getOrders catch block (axios.get rejects)", async () => {
    // Keep user authenticated so effect calls getOrders
    localStorage.setItem(
      "auth",
      JSON.stringify({
        user: { _id: "u1", name: "Buyer A", role: 0, email: "a@a.com" },
        token: "buyer-token",
      })
    );

    // First categories ok
    mockedAxios.get.mockImplementationOnce((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: { success: true, category: [] } });
      }
      return Promise.resolve({ data: {} });
    });
    // Then orders throws
    mockedAxios.get.mockRejectedValueOnce(new Error("orders fail"));

    // Avoid noisy console in test output
    const errSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    render(
      <TestWrapper>
        <Orders />
      </TestWrapper>
    );

    // Component still renders heading; no table due to failure
    expect(
      await screen.findByRole("heading", { name: /all orders/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole("table")).toBeNull();
    });

    errSpy.mockRestore();
  });

  test("empty state ([]) doesn't crash and still shows page heading", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: { success: true, category: [] } });
      }
      if (url === "/api/v1/auth/orders") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <TestWrapper>
        <Orders />
      </TestWrapper>
    );

    expect(
      await screen.findByRole("heading", { name: /all orders/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole("table")).toBeNull();
    });
  });
});
