import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "../../context/auth";
import { Toaster } from "react-hot-toast";
import Login  from "./Login.js";
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

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

const plaintextPassword = "1234";

const testUser = {
  name: "abc",
  email: "abc@gmail.com",
  password: "$2b$10$mWX4r/E.1Ybz.uQn5giJ/Oeo3rcgPOBijw9SWLQSQDUJ1vVsHHvse",
  phone: "1234",
  address: "1234",
  answer: "football",
  dob: "2000-01-01",
};

describe("Login Page Integration", () => {
  beforeAll(async () => {
    // ensure a clean storage between tests
    localStorage.clear();
    await resetSeedDatabase();
    await seedUserData([testUser]);
  }, 15000); // Increase timeout to 15 seconds

  afterAll(async () => {
    localStorage.clear();
    await resetSeedDatabase();
  });

  it("should set auth state upon successful login", async () => {
    let authState = null;
    
    const AuthStateChecker = () => {
      const [auth] = useAuth();
      authState = auth;
      return null;
    };
    
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Toaster />
          <AuthStateChecker />
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter Your Email'), {
      target: { value: testUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
      target: { value: plaintextPassword },
    });
    fireEvent.click(screen.getByRole('button', { name: 'LOGIN' }));

    await waitFor(() => {
      expect(authState).toEqual({
        user: expect.objectContaining({ email: testUser.email }),
        token: expect.any(String),
      });
    }, { timeout: 10000 });
  }, 15000);
});