import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "../../components/Routes/Private";
import Dashboard from "../../pages/user/Dashboard.js";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import axios from "axios";

jest.mock("axios");

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

const testUser1 = {
  name: "Test User",
  email: "testuser@gmail.com",
  password: "password123",
  phone: "1234567890",
  address: "123 Main Street, Singapore",
  answer: "Test Answer",
  dob: new Date("2000-01-01"),
};

const testAuthToken = "fake-valid-token";

function renderPrivateRouteWithDashboard() {
  return render(
    <AuthProvider>
      <SearchProvider>
        <CartProvider>
          <MemoryRouter initialEntries={["/dashboard/user"]}>
            <Routes>
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard/user" element={<Dashboard />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

describe("PrivateRoute Integration", () => {
    beforeEach(() => {
      // ensure a clean storage between tests
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

  it("renders the protected page when authenticated", async () => {
    // Put authenticated user data in localStorage so AuthProvider picks it up
    localStorage.setItem(
      "auth",
      JSON.stringify({ user: testUser1, token: testAuthToken })
    );
    axios.get.mockResolvedValueOnce({ data: { ok: true } });

    renderPrivateRouteWithDashboard();

    await waitFor(() =>
      expect(screen.getByRole("main")).toBeInTheDocument()
    );
  });

  it("renders spinner when not authenticated", async () => {
    renderPrivateRouteWithDashboard();

    // Expect Spinner (you can query by its test id or text)
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
