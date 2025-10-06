import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Orders from "./Orders";
import axios from "axios";

// ---- mocks ----
jest.mock("axios");

jest.mock("../../context/auth", () => ({ useAuth: jest.fn() }));
const { useAuth } = jest.requireMock("../../context/auth");

jest.mock("../../components/UserMenu", () => () => <div data-testid="user-menu" />);
jest.mock("../../components/Layout", () => ({ children }) => <div data-testid="layout">{children}</div>);

jest.mock("moment", () => (date) => ({ fromNow: () => "3 days ago" }));

jest.mock("../../context/cart", () => ({ useCart: jest.fn(() => [[], jest.fn()]) }));
jest.mock("../../context/search", () => ({ useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]) }));
jest.mock("../../hooks/useCategory", () => jest.fn(() => ({ categories: [] })));

// helper to make an order object shaped exactly like the component expects
const makeOrder = ({
    status = "Processing",
    buyerName = "Alice",
    created = "2025-10-01T00:00:00.000Z",
    paymentSuccess = true,
    products = [{ _id: "p1", name: "Widget", description: "A very nice widget", price: 99.5 }],
    } = {}) => ({
    status,
    buyer: { name: buyerName },
    createAt: created, // component uses createAt (typo), so keep it
    payment: { success: paymentSuccess },
    products,
});

describe("<Orders />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("does NOT fetch when there is no auth token", async () => {
        useAuth.mockReturnValue([{ token: "" }, jest.fn()]);
        render(
        <MemoryRouter>
            <Orders />
        </MemoryRouter>
        );

        // page chrome
        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(screen.getByText(/All Orders/i)).toBeInTheDocument();

        // no call made
        expect(axios.get).not.toHaveBeenCalled();
    });

    it("fetches and renders orders when token exists (covers token gate)", async () => {
        useAuth.mockReturnValue([{ token: "abc123" }, jest.fn()]);
        const orders = [
        makeOrder({
            status: "Shipped",
            buyerName: "Bob",
            paymentSuccess: true,
            products: [
            { _id: "p1", name: "Phone", description: "Latest model smartphone", price: 1200 },
            { _id: "p2", name: "Case", description: "Protective case", price: 29.9 },
            ],
        }),
        ];
        axios.get.mockResolvedValueOnce({ data: orders });

        render(
        <MemoryRouter>
            <Orders />
        </MemoryRouter>
        );

        // wait for fetch to be triggered by useEffect and for rows to render
        await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders"));

        // table row cells
        expect(await screen.findByText("Shipped")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
        expect(screen.getByText("3 days ago")).toBeInTheDocument(); // from mocked moment
        expect(screen.getByText("Success")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument(); // quantity

        // product cards
        expect(screen.getByText("Phone")).toBeInTheDocument();
        expect(screen.getByText("Case")).toBeInTheDocument();
        // image + src path
        expect(screen.getByAltText("Phone")).toHaveAttribute("src", "/api/v1/product/product-photo/p1");
    });

    it("renders 'Failed' when payment is not successful", async () => {
        useAuth.mockReturnValue([{ token: "abc123" }, jest.fn()]);
        axios.get.mockResolvedValueOnce({ data: [makeOrder({ paymentSuccess: false })] });

        render(
        <MemoryRouter>
            <Orders />
        </MemoryRouter>
        );

        expect(await screen.findByText("Failed")).toBeInTheDocument();
    });

    it("renders products with description truncated to 30 chars (covers substring branch)", async () => {
        useAuth.mockReturnValue([{ token: "abc123" }, jest.fn()]);
        const longDesc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 36 chars
        const expectedTruncated = longDesc.substring(0, 30);       // first 30 chars

        axios.get.mockResolvedValueOnce({
        data: [
            makeOrder({
            products: [{ _id: "p3", name: "Gadget", description: longDesc, price: 77 }],
            }),
        ],
        });

        render(
        <MemoryRouter>
            <Orders />
        </MemoryRouter>
        );

        // wait for data
        await screen.findByText("Gadget");

        // truncated description is rendered
        expect(screen.getByText(expectedTruncated)).toBeInTheDocument();
        // price line visible
        expect(screen.getByText(/Price : 77/)).toBeInTheDocument();
    });

    it("handles empty orders array without crashing", async () => {
        useAuth.mockReturnValue([{ token: "abc123" }, jest.fn()]);
        axios.get.mockResolvedValueOnce({ data: [] });

        render(
        <MemoryRouter>
            <Orders />
        </MemoryRouter>
        );

        await screen.findByText(/All Orders/i);
        expect(axios.get).toHaveBeenCalled();
        // No product price rendered
        expect(screen.queryByText(/Price :/i)).not.toBeInTheDocument();
    });

    it("logs error and renders shell when API call throws", async () => {
        useAuth.mockReturnValue([{ token: "abc123" }, jest.fn()]);
        axios.get.mockRejectedValueOnce(new Error("boom"));

        render(
        <MemoryRouter>
            <Orders />
        </MemoryRouter>
        );

        await screen.findByText(/All Orders/i);
        expect(axios.get).toHaveBeenCalled();
        // Still no product cells
        expect(screen.queryByText(/Price :/i)).not.toBeInTheDocument();
    });

    it("triggers fetch when token becomes available AFTER first render (explicitly hits the if(token) line)", async () => {
        // start with a stable auth object that we can mutate
        const authState = { token: "" };
        const setAuth = jest.fn();
        useAuth.mockImplementation(() => [authState, setAuth]);

        axios.get.mockResolvedValueOnce({ data: [] });

        const { rerender } = render(
        <MemoryRouter>
            <Orders />
        </MemoryRouter>
        );

        // no token yet -> no fetch
        expect(axios.get).not.toHaveBeenCalled();

        // flip the token and rerender to re-run the effect
        authState.token = "now-i-have-token";
        rerender(
        <MemoryRouter>
            <Orders />
        </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders"));
    });
});
