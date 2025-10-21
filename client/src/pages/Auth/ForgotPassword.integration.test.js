import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "../../context/auth";
import { Toaster } from "react-hot-toast";
import ForgotPassword from "./ForgotPassword.js";
import {
  resetSeedDatabase,
  seedUserData,
} from "../../setupSeedDataRoutes";

// following hooks are mocked since they are not relevant to the test
jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

const testUser = {
  name: "abc",
  email: "abc@gmail.com",
  password: "$2b$10$mWX4r/E.1Ybz.uQn5giJ/Oeo3rcgPOBijw9SWLQSQDUJ1vVsHHvse",
  phone: "1234",
  address: "1234",
  answer: "football",
  dob: "2000-01-01",
};

describe("Forgot Password Page Integration", () => {
  beforeEach(async () => {
    // ensure a clean storage between tests
    await resetSeedDatabase();
    await seedUserData(testUser);
  });

  afterEach(async () => {
    await resetSeedDatabase();
  });

  it("should reset auth state when password is reset", async () => {
    let authState = null;
    
    const AuthStateChecker = () => {
      const [auth] = useAuth();
      authState = auth;
      return null;
    };
    
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/forgot-password"]}>
          <Toaster />
          <AuthStateChecker />
          <Routes>
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter Your Email'), {
      target: { value: testUser.email }
    });
    fireEvent.change(screen.getByPlaceholderText('What is your favorite sport?'), {
      target: { value: testUser.answer }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your New Password'), {
      target: { value: testUser.password }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Your New Password'), {
      target: { value: testUser.password }
    });
    fireEvent.click(screen.getByRole('button', { name: 'RESET PASSWORD' }));

    await waitFor(() => {
      expect(authState).toEqual({
        user: null,
        token: "",
      });
    });
  });
});