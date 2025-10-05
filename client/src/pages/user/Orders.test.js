import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Orders from "./Orders";
import axios from "axios";

jest.mock("axios");

// mock the auth context hook to control token presence
jest.mock("../src/context/auth", () => ({
    useAuth: jest.fn(),
}));

// mock shell components to keep test focused
jest.mock("../src/components/UserMenu", () => () => <div data-testid="user-menu" />);
jest.mock("../src/components/Layout", () => ({ children }) => <div data-testid="layout">{children}</div>);

// mock moment to a stable "fromNow" output so tests don't depend on time
jest.mock("moment", () => () => ({ fromNow: () => "3 days ago" }));

const { useAuth } = jest.requireMock("../src/context/auth");

// helper: build a fake order
const makeOrder = ({
    status = "Processing",
    buyerName = "Alice",
    created = "2025-10-01T00:00:00.000Z",
    paymentSuccess = true,
    products = [
    { _id: "p1", name: "Widget", description: "A very nice widget", price: 99.5 },
    ],
} = {}) => ({
    status,
    buyer: { name: buyerName },
    createAt: created,
    payment: { success: paymentSuccess },
    products,
});

describe("<Orders />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("does NOT fetch orders when there is no auth token", () => {
        useAuth.mockReturnValue([{ token: null }, jest.fn()]);
        render(<Orders />);
        expect(axios.get).not.toHaveBeenCalled();
        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(screen.getByText(/All Orders/i)).toBeInTheDocument();
    });

    test("fetches and renders orders when token exists", async () => {
        const orders = [
            makeOrder({
                status: "Shipped",
                buyerName: "Bob",
                paymentSuccess: true,
                products: [
                    { _id: "p1", name: "Phone", description: "Latest model", price: 1200 },
                    { _id: "p2", name: "Case", description: "Protective case", price: 29.9 },
                ],
            }),
        ];
        useAuth.mockReturnValue([{ token: "abc123" }, jest.fn()]);
        axios.get.mockResolvedValueOnce({ data: orders });

        render(<Orders />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
        });

        // table cells
        expect(screen.getByText("Shipped")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
        // relative time via mocked moment
        expect(screen.getByText("3 days ago")).toBeInTheDocument();
        // payment and quantity
        expect(screen.getByText("Success")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();

        // product cards
        expect(screen.getByText("Phone")).toBeInTheDocument();
        expect(screen.getByText("Case")).toBeInTheDocument();
        // description is truncated in component; verify prefix exists
        expect(screen.getByText(/Latest model/i)).toBeInTheDocument();
    });

    test("renders 'Failed' when payment is not successful", async () => {
        const orders = [makeOrder({ paymentSuccess: false })];
        useAuth.mockReturnValue([{ token: "abc123" }, jest.fn()]);
        axios.get.mockResolvedValueOnce({ data: orders });

        render(<Orders />);

        await waitFor(() => {
            expect(screen.getByText("Failed")).toBeInTheDocument();
        });
    });

    test("handles empty orders array without crashing", async () => {
        useAuth.mockReturnValue([{ token: "abc123" }, jest.fn()]);
        axios.get.mockResolvedValueOnce({ data: [] });

        render(<Orders />);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());
        expect(screen.getByText(/All Orders/i)).toBeInTheDocument();
        expect(screen.queryByText(/Price :/i)).not.toBeInTheDocument();
    });
});

