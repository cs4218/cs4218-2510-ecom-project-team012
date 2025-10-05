import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../src/context/auth", () => ({ useAuth: jest.fn() }));
jest.mock("../src/context/cart", () => ({ useCart: jest.fn() }));
jest.mock("../src/hooks/useCategory", () => jest.fn());
jest.mock("../src/components/Form/SearchInput", () => () => <div data-testid="search-input" />);
// antd Badge → simple wrapper exposing count for assertions
jest.mock("antd", () => ({ Badge: ({ count, children }) => <div data-testid="badge" data-count={count}>{children}</div> }));
// CSS import
jest.mock("../src/styles/Header.css", () => ({}), { virtual: true });
// toast (default export)
jest.mock("react-hot-toast", () => ({ __esModule: true, default: { success: jest.fn() } }));

import Header from "./Header";
import { useAuth } from "../src/context/auth";
import { useCart } from "../src/context/cart";
import useCategory from "../src/hooks/useCategory";
import toast from "react-hot-toast";

const renderHeader = () =>
    render(
        <MemoryRouter>
        <Header />
        </MemoryRouter>
    );

beforeEach(() => {
    jest.clearAllMocks();
    (useCart).mockReturnValue([[]]);
    (useCategory).mockReturnValue([{ name: "Phones", slug: "phones" }, { name: "Laptops", slug: "laptops" }]);
});

test("logged-out view: brand, home, categories, register/login, cart badge", () => {
    (useAuth).mockReturnValue([{ user: null, token: "" }, jest.fn()]);
    renderHeader();

    expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();   // brand
    expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
    // categories menu content is in DOM
    expect(screen.getByText(/All Categories/i)).toBeInTheDocument();
    expect(screen.getByText("Phones")).toBeInTheDocument();
    expect(screen.getByText("Laptops")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Login/i })).toBeInTheDocument();

    // cart badge reflects array length
    expect(screen.getByTestId("badge")).toHaveAttribute("data-count", "0");
});

test("logged-in view: shows username, dashboard(user), logout triggers toast and clears storage", async () => {
    const setAuth = jest.fn();
    (useAuth).mockReturnValue([{ user: { name: "Alice", role: 0 }, token: "t" }, setAuth]);
    (useCart).mockReturnValue([[1, 2]]); // two items
    renderHeader();

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dashboard/i })).toHaveAttribute("href", "/dashboard/user");
    expect(screen.getByTestId("badge")).toHaveAttribute("data-count", "2");

    // click Logout
    const removeSpy = jest.spyOn(window.localStorage.__proto__, "removeItem");
    const logout = screen.getByRole("link", { name: /Logout/i });
    await userEvent.click(logout);

    expect(removeSpy).toHaveBeenCalledWith("auth");
    expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
    // setAuth should be called with user reset + empty token
    expect(setAuth).toHaveBeenCalledWith(expect.objectContaining({ user: null, token: "" }));
    removeSpy.mockRestore();
});

test("admin dashboard path when role=1", () => {
    (useAuth).mockReturnValue([{ user: { name: "Bob", role: 1 }, token: "t" }, jest.fn()]);
    renderHeader();
    expect(screen.getByRole("link", { name: /Dashboard/i })).toHaveAttribute("href", "/dashboard/admin");
});
