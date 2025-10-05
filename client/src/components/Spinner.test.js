import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Spinner from "./Spinner";

const mockNavigate = jest.fn();
const mockLocation = { pathname: "/secret" };

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
}));

const mount = (pathProp) =>
    render(
        <BrowserRouter>
        <Spinner path={pathProp} />
        </BrowserRouter>
    );

describe("Spinner", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it("renders initial countdown and loader", () => {
        mount();
        expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();
        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    it("ticks down each second", async () => {
        mount();
        expect(screen.getByText(/3 second/i)).toBeInTheDocument();

        jest.advanceTimersByTime(1000);
        await waitFor(() => expect(screen.getByText(/2 second/i)).toBeInTheDocument());

        jest.advanceTimersByTime(1000);
        await waitFor(() => expect(screen.getByText(/1 second/i)).toBeInTheDocument());
    });

    it("navigates to /login by default after 3s and preserves state", async () => {
        mount();
        jest.advanceTimersByTime(3000);

        await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/secret" });
        });
    });

    it("navigates to custom path when provided", async () => {
        mount("register");
        jest.advanceTimersByTime(3000);

        await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/register", { state: "/secret" });
        });
    });

    it("cleans up interval on unmount", () => {
        const clearSpy = jest.spyOn(global, "clearInterval");
        const { unmount } = mount();
        unmount();
        expect(clearSpy).toHaveBeenCalled();
        clearSpy.mockRestore();
    });
});
