import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./Profile";
import { useAuth } from "../../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn()
}));
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
    error: jest.fn()
}));
jest.mock("./../../components/Layout", () => ({ children }) => <div>{children}</div>);
let setAuth;
let localStorageMock;


describe("Profile Component (unit tests)", () => {

    const testProfile = { name: "John", email: "john@example.com", phone: "12345", address: "Somewhere" };

    beforeEach(() => {
        setAuth = jest.fn();
        useAuth.mockReturnValue([{ user: testProfile }, setAuth]);

        localStorageMock = {
            getItem: jest.fn(() => JSON.stringify({ user: testProfile })),
            setItem: jest.fn()
        };
        Object.defineProperty(window, "localStorage", { value: localStorageMock });

        jest.clearAllMocks();
    });

    it("should render form with initial profile correctly", () => {
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText("Enter Your Name")).toHaveValue(testProfile.name);
        expect(screen.getByPlaceholderText("Enter Your Email")).toHaveValue(testProfile.email);
        expect(screen.getByPlaceholderText("Enter Your Phone")).toHaveValue(testProfile.phone);
        expect(screen.getByPlaceholderText("Enter Your Address")).toHaveValue(testProfile.address);
    });

    it("should update input values on change", () => {
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        const nameInput = screen.getByPlaceholderText("Enter Your Name");
        fireEvent.change(nameInput, { target: { value: "Jane" } });
        expect(nameInput.value).toBe("Jane");

        const emailInput = screen.getByPlaceholderText("Enter Your Email");
        fireEvent.change(emailInput, { target: { value: "email@email.com" } });
        expect(emailInput.value).toBe("email@email.com");

        const passwordInput = screen.getByPlaceholderText("Enter Your Password");
        fireEvent.change(passwordInput, { target: { value: "secret" } });
        expect(passwordInput.value).toBe("secret");

        const phoneInput = screen.getByPlaceholderText("Enter Your Phone");
        fireEvent.change(phoneInput, { target: { value: "1234567890" } });
        expect(phoneInput.value).toBe("1234567890");

        const addressInput = screen.getByPlaceholderText("Enter Your Address");
        fireEvent.change(addressInput, { target: { value: "123 Street" } });
        expect(addressInput.value).toBe("123 Street");
    });


    it("should submit updated profile successfully", async () => {
        const updatedUser = { name: "Jane", email: "john@example.com", phone: "12345", address: "Somewhere" };

        axios.put.mockResolvedValue({
            data: { success: true, updatedUser }
        });

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { target: { value: "Jane" } });
        fireEvent.submit(screen.getByRole("button", { name: "UPDATE" }));

        await waitFor(() => {
            expect(setAuth).toHaveBeenCalledWith({ user: updatedUser });
            const expectedLS = JSON.stringify({ user: updatedUser });
            expect(window.localStorage.setItem).toHaveBeenCalledWith("auth", expectedLS);
            expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
        });
    });

    it("should display error when API returns failure", async () => {
        axios.put.mockResolvedValue({
            data: { error: "Something bad happened" }
        });

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        fireEvent.submit(screen.getByRole("button", { name: "UPDATE" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something bad happened");
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
            expect(setAuth).not.toHaveBeenCalled();
        });
    });

    it("should handle unexpected API errors", async () => {
        axios.put.mockRejectedValue(new Error("Intentional Test Error"));

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        fireEvent.submit(screen.getByRole("button", { name: "UPDATE" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something went wrong");
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
            expect(setAuth).not.toHaveBeenCalled();
        });
    });
});
