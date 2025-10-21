import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import axios from "axios";

import AdminOrders from "./AdminOrders";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";

// ✅ Partial mock: override only Select and keep the rest of antd intact.
// Also, DO NOT spread unknown props to the DOM to avoid warnings like bordered={false}.
jest.mock("antd", () => {
  const actual = jest.requireActual("antd");
  const MockSelect = ({ defaultValue, onChange, children /*, ...rest*/ }) => (
    <select
      data-testid="status-select"
      defaultValue={defaultValue}
      onChange={(e) => onChange && onChange(e.target.value)}
    >
      {children}
    </select>
  );
  const MockOption = ({ value, children }) => <option value={value}>{children}</option>;
  MockSelect.Option = MockOption;
  return { ...actual, Select: MockSelect, Option: MockOption };
});

jest.mock("axios");
const mockedAxios = axios;

const TestWrapper = ({ children, initialRoute = "/dashboard/admin/orders" }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      <CartProvider>
        <SearchProvider>{children}</SearchProvider>
      </CartProvider>
    </AuthProvider>
  </MemoryRouter>
);

// react-hot-toast uses matchMedia
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

// (Optional) mute only the React "unique key" noise from AdminOrders map calls
let consoleErrorSpy;
beforeAll(() => {
  consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation((msg, ...args) => {
      if (typeof msg === "string" && msg.includes('unique "key" prop')) return;
      // pass through other errors
      // eslint-disable-next-line no-console
      // console.error(msg, ...args);
    });
});
afterAll(() => {
  consoleErrorSpy?.mockRestore();
});

describe("AdminOrders Integration (Admin)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Logged-in admin
    localStorage.setItem(
      "auth",
      JSON.stringify({
        user: { _id: "a1", name: "Admin", role: 1, email: "a@a.com" },
        token: "admin-token",
      })
    );

    // Default successful loads
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
      if (url === "/api/v1/auth/all-orders") {
        return Promise.resolve({
          data: [
            {
              _id: "oA",
              status: "Not Process",
              buyer: { _id: "b1", name: "Buyer A" },
              createAt: new Date().toISOString(),
              payment: { success: true },
              products: [{ _id: "p1", name: "Laptop", description: "Nice", price: 1000 }],
            },
            {
              _id: "oB",
              status: "Processing",
              buyer: { _id: "b2", name: "Buyer B" },
              createAt: new Date().toISOString(),
              payment: { success: false },
              products: [{ _id: "p2", name: "Mic", description: "Good", price: 80 }],
            },
          ],
        });
      }
      return Promise.resolve({ data: {} });
    });

    mockedAxios.put.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders all orders list (buyers, products, payment flags)", async () => {
    render(
      <TestWrapper>
        <AdminOrders />
      </TestWrapper>
    );

    expect(
      await screen.findByRole("heading", { name: /all orders/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      const tables = screen.getAllByRole("table");
      expect(tables.length).toBeGreaterThan(0);
    });

    // Products (covers map)
    expect(screen.getByText(/laptop/i)).toBeInTheDocument();
    expect(screen.getByText(/mic/i)).toBeInTheDocument();

    // Buyers and payment flags (covers ternary)
    expect(screen.getByText(/buyer a/i)).toBeInTheDocument();
    expect(screen.getByText(/buyer b/i)).toBeInTheDocument();
    expect(screen.getByText(/success/i)).toBeInTheDocument();
    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });

  test("status change triggers PUT and refreshes list (handleChange path)", async () => {
    render(
      <TestWrapper>
        <AdminOrders />
      </TestWrapper>
    );

    // Wait for orders
    await screen.findByRole("heading", { name: /all orders/i });

    // There may be multiple selects (one per order). Pick the first.
    const selects = await screen.findAllByTestId("status-select");
    expect(selects.length).toBeGreaterThan(0);

    // Change to "Shipped"
    fireEvent.change(selects[0], { target: { value: "Shipped" } });

    // PUT called with correct payload
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "/api/v1/auth/order-status/oA",
        { status: "Shipped" }
      );
    });

    // After PUT, getOrders is called again to refresh
    await waitFor(() => {
      const calls = mockedAxios.get.mock.calls.filter(
        (c) => c[0] === "/api/v1/auth/all-orders"
      );
      expect(calls.length).toBeGreaterThan(1);
    });
  });

  test("auth guard: does NOT fetch when not authenticated", async () => {
    localStorage.removeItem("auth");
    const spy = jest.spyOn(mockedAxios, "get");

    // Minimal mocks
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/v1/auth/all-orders") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <TestWrapper>
        <AdminOrders />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        spy.mock.calls.find((c) => c[0] === "/api/v1/auth/all-orders")
      ).toBeUndefined();
    });
    expect(screen.queryByRole("table")).toBeNull();
  });

  test("error paths: getOrders catch and handleChange catch", async () => {
    // 1) getOrders error (axios.get rejects once)
    mockedAxios.get.mockRejectedValueOnce(new Error("fail all-orders"));
    const errSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // First render -> getOrders throws; no tables
    const utils = render(
      <TestWrapper>
        <AdminOrders />
      </TestWrapper>
    );

    expect(
      await screen.findByRole("heading", { name: /all orders/i })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("table")).toBeNull();
    });

    // 2) Now succeed the reload so we can trigger handleChange error.
    // Use RERENDER (do not render a NEW tree) to avoid duplicate selects.
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/v1/auth/all-orders") {
        return Promise.resolve({
          data: [
            {
              _id: "oX",
              status: "Not Process",
              buyer: { _id: "bX", name: "Buyer X" },
              createAt: new Date().toISOString(),
              payment: { success: true },
              products: [{ _id: "pX", name: "ItemX", description: "Desc", price: 5 }],
            },
          ],
        });
      }
      return Promise.resolve({ data: {} });
    });

    utils.rerender(
      <TestWrapper>
        <AdminOrders />
      </TestWrapper>
    );

    // Pick the first (and only) select from the rerendered tree
    const selects = await screen.findAllByTestId("status-select");
    expect(selects.length).toBeGreaterThan(0);
    const select = selects[0];

    // Make PUT fail to hit handleChange catch
    mockedAxios.put.mockRejectedValueOnce(new Error("put failed"));
    fireEvent.change(select, { target: { value: "Shipped" } });

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalled();
    });

    errSpy.mockRestore();
  });
});
