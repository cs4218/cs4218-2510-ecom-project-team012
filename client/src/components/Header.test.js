import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";

jest.mock("../context/auth", () => ({ useAuth: jest.fn() }));
jest.mock("../context/cart", () => ({ useCart: jest.fn() }));
jest.mock("../hooks/useCategory", () => jest.fn());
jest.mock("./Form/SearchInput", () => () => <div data-testid="search" />);

jest.mock("antd", () => ({
    Badge: ({ count, children }) => (
        <div data-testid="cart-badge" data-count={String(count)}>{children}</div>
    ),
}));

jest.mock("react-hot-toast", () => ({ __esModule: true, default: { success: jest.fn() } }));

import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import toast from "react-hot-toast";

const renderHeader = () =>
    render(
        <MemoryRouter>
        <Header />
        </MemoryRouter>
    );

    describe("Header", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useCategory).mockReturnValue({
        categories: [
            { name: "Phones", slug: "phones" },
            { name: "Laptops", slug: "laptops" },
        ],
        });
        (useCart).mockReturnValue([[]]);
    });

    it("renders logged-out navigation (brand, home, categories, register, login)", () => {
        (useAuth).mockReturnValue([{ user: null, token: "" }, jest.fn()]);
        renderHeader();

        expect(screen.getByRole("link", { name: /Virtual Vault/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();

        expect(screen.getByRole("link", { name: /^Categories$/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /All Categories/i })).toBeInTheDocument();

        expect(screen.getByRole("link", { name: /Register/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Login/i })).toBeInTheDocument();
        expect(screen.getByTestId("cart-badge")).toHaveAttribute("data-count", "0");
    });

    it("renders dynamic category items from useCategory (covers categories.map)", () => {
        (useAuth).mockReturnValue([{ user: null, token: "" }, jest.fn()]);
        renderHeader();

        expect(screen.getByRole("link", { name: "Phones" })).toHaveAttribute("href", "/category/phones");
        expect(screen.getByRole("link", { name: "Laptops" })).toHaveAttribute("href", "/category/laptops");
    });

    it("shows user dropdown and cart count when logged in (role user)", async () => {
        const setAuth = jest.fn();
        (useAuth).mockReturnValue([{ user: { name: "Alice", role: 0 }, token: "t" }, setAuth]);
        (useCart).mockReturnValue([[{}, {}]]);
        renderHeader();

        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Dashboard/i })).toHaveAttribute("href", "/dashboard/user");
        expect(screen.getByTestId("cart-badge")).toHaveAttribute("data-count", "2");
    });

    it("routes dashboard to admin when role=1", () => {
        (useAuth).mockReturnValue([{ user: { name: "Bob", role: 1 }, token: "t" }, jest.fn()]);
        renderHeader();
        expect(screen.getByRole("link", { name: /Dashboard/i })).toHaveAttribute("href", "/dashboard/admin");
    });

    it("Logout clears localStorage, resets auth, and shows toast", async () => {
        const setAuth = jest.fn();
        (useAuth).mockReturnValue([{ user: { name: "Alice", role: 0 }, token: "t" }, setAuth]);
        const removeSpy = jest.spyOn(window.localStorage.__proto__, "removeItem");

        renderHeader();
        await userEvent.click(screen.getByRole("link", { name: /Logout/i }));

        expect(removeSpy).toHaveBeenCalledWith("auth");
        expect(toast.success).toHaveBeenCalled();
        expect(setAuth).toHaveBeenCalledWith(expect.objectContaining({ user: null, token: "" }));
        removeSpy.mockRestore();
    });
});
