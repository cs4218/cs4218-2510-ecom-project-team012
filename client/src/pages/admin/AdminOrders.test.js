// client/src/pages/admin/AdminOrders.test.js
import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import AdminOrders from "./AdminOrders";

// --- Full module mocks ---
jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
}));
import axios from "axios";

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));
jest.mock("../../components/AdminMenu", () => ({
  __esModule: true,
  default: () => <div data-testid="admin-menu" />,
}));

const mockUseAuth = jest.fn();
jest.mock("../../context/auth", () => ({
  useAuth: (...args) => mockUseAuth(...args),
}));

jest.mock("moment", () => {
  const fn = () => ({ fromNow: () => "3 days ago" });
  fn.default = fn;
  return fn;
});

jest.mock("antd", () => {
  const Select = ({ defaultValue, onChange, children, bordered }) => (
    <select
      data-testid="status-select"
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      aria-label="status"
      data-bordered={String(bordered)}
    >
      {children}
    </select>
  );
  Select.Option = ({ value, children }) => <option value={value}>{children}</option>;
  return { Select };
});

// --- Test data ---
const SAMPLE_ORDERS = [
  {
    _id: "order1",
    status: "Not Process",
    buyer: { name: "Alice" },
    createAt: "2025-10-01T00:00:00.000Z",
    payment: { success: true },
    products: [
      {
        _id: "p1",
        name: "Widget A",
        description: "AAA BBB CCC DDD EEE FFF GGG",
        price: 12.34,
      },
      {
        _id: "p2",
        name: "Widget B",
        description: "This is a slightly longer description...",
        price: 56.78,
      },
    ],
  },
  {
    _id: "order2",
    status: "Processing",
    buyer: { name: "Bob" },
    createAt: "2025-10-02T00:00:00.000Z",
    payment: { success: false },
    products: [
      {
        _id: "p3",
        name: "Gadget X",
        description: "Short desc",
        price: 99.99,
      },
    ],
  },
];

const setAuth = (token) => mockUseAuth.mockReturnValue([{ token }, jest.fn()]);

describe("AdminOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does NOT fetch orders when auth token is absent", () => {
    setAuth(null);
    render(<AdminOrders />);
    expect(axios.get).not.toHaveBeenCalled();
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("fetches and renders orders when token is present", async () => {
    setAuth("tok");
    axios.get.mockResolvedValueOnce({ data: SAMPLE_ORDERS });

    render(<AdminOrders />);

    // Wait for rows to render (not just for axios to be called)
    await screen.findByText("Alice");
    await screen.findByText("Bob");

    // Chrome exists
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
    expect(screen.getByText("All Orders")).toBeInTheDocument();

    // Date via mocked moment
    expect(screen.getAllByText("3 days ago").length).toBeGreaterThan(0);

    // Payment statuses
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();

    // Quantities (2 and 1), scoped per-row to avoid clashes with the "#" column
    const aliceRow = screen.getByText("Alice").closest("tr");
    expect(aliceRow).not.toBeNull();
    expect(within(aliceRow).getByText("2")).toBeInTheDocument();
    const bobRow = screen.getByText("Bob").closest("tr");
    expect(bobRow).not.toBeNull();
    expect(within(bobRow).getByText("1")).toBeInTheDocument();

    // Products & prices
    expect(screen.getByText("Widget A")).toBeInTheDocument();
    expect(screen.getByText("Widget B")).toBeInTheDocument();
    expect(screen.getByText("Gadget X")).toBeInTheDocument();
    expect(screen.getByText(/Price : 12\.34/)).toBeInTheDocument();
    expect(screen.getByText(/Price : 56\.78/)).toBeInTheDocument();
    expect(screen.getByText(/Price : 99\.99/)).toBeInTheDocument();

    // One truncated description (substring(0, 30))
    const truncated = SAMPLE_ORDERS[0].products[0].description.substring(0, 30);
    expect(screen.getByText(truncated)).toBeInTheDocument();

    // Status selects
    const selects = await screen.findAllByTestId("status-select");
    expect(selects).toHaveLength(2);
    expect(selects[0].value).toBe("Not Process");
    expect(selects[1].value).toBe("Processing");

    // Option labels present
    const expectedStatuses = ["Not Process", "Processing", "Shipped", "deliverd", "cancel"];
    for (const label of expectedStatuses) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  test("changing status calls axios.put then re-fetches orders", async () => {
    setAuth("tok");
    // Initial fetch
    axios.get.mockResolvedValueOnce({ data: SAMPLE_ORDERS });
    // Re-fetch after PUT
    axios.get.mockResolvedValueOnce({ data: SAMPLE_ORDERS });
    axios.put.mockResolvedValueOnce({ data: { ok: true } });

    render(<AdminOrders />);

    // Wait for list
    await screen.findByText("Alice");

    const firstSelect = (await screen.findAllByTestId("status-select"))[0];
    expect(firstSelect.value).toBe("Not Process");

    // Change to "Shipped"
    fireEvent.change(firstSelect, { target: { value: "Shipped" } });

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/auth/order-status/order1",
        { status: "Shipped" }
      )
    );

    // Re-fetched (called twice total)
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test("handles getOrders error branch", async () => {
    setAuth("tok");
    const err = new Error("boom-get");
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(err);

    render(<AdminOrders />);

    // Wait for the effect to run & the catch to log
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(logSpy).toHaveBeenCalled()); // don't assert the exact arg identity

    logSpy.mockRestore();
  });

  test("handles handleChange error branch", async () => {
    setAuth("tok");
    axios.get.mockResolvedValueOnce({ data: SAMPLE_ORDERS }); // initial fetch OK
    const err = new Error("boom-put");
    axios.put.mockRejectedValueOnce(err);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    render(<AdminOrders />);

    await screen.findByText("Alice"); // ensure initial render done

    const firstSelect = (await screen.findAllByTestId("status-select"))[0];
    fireEvent.change(firstSelect, { target: { value: "cancel" } });

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    await waitFor(() => expect(logSpy).toHaveBeenCalled()); // error path hit

    logSpy.mockRestore();
  });
});
