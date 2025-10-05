import React from "react";
import { render, screen, act } from "@testing-library/react";

jest.useFakeTimers();

// Mock react-router-dom navigation hooks
const navigateMock = jest.fn();
jest.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock,
    useLocation: () => ({ pathname: "/secret" }),
}));

import Spinner from "./Spinner";

beforeEach(() => {
    navigateMock.mockClear();
    jest.clearAllTimers();
});

test("counts down 3→0 and navigates to /login by default", () => {
    render(<Spinner />);

    // initial text shows '3'
    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(3000); });

    expect(navigateMock).toHaveBeenCalledWith("/login", { state: "/secret" });
});

test("navigates to custom path", () => {
    render(<Spinner path="register" />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(navigateMock).toHaveBeenCalledWith("/register", { state: "/secret" });
});
