import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";

// General structure generated with the help of AI

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

function renderDashboardPage() {
  return render(
    <AuthProvider>
      <SearchProvider>
        <CartProvider>
          <MemoryRouter initialEntries={["/dashboard/user"]}>
            <Routes>
              <Route path="/dashboard/user" element={<Dashboard />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

describe("Dashboard Page Integration", () => {
  beforeEach(() => {
    // ensure a clean storage between tests
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("should render dashboard information and components when user is authenticated", () => {
    beforeEach(() => {
      // Put authenticated user data in localStorage so AuthProvider picks it up
      localStorage.setItem(
        "auth",
        JSON.stringify({ user: testUser1, token: testAuthToken })
      );
    });

    it("should render dashboard title and user info from localStorage", async () => {
      // Act
      renderDashboardPage();

      // Assert`
      await waitFor(() => expect(screen.getByRole("main")).toBeInTheDocument());

      const card = screen.getByTestId("user-info-card");
      expect(within(card).getByText(testUser1.name)).toBeInTheDocument();
      expect(within(card).getByText(testUser1.email)).toBeInTheDocument();
      expect(within(card).getByText(testUser1.address)).toBeInTheDocument();
    });

    it("should render user menu succesfully with profile and orders links", async () => {
      // Act
      renderDashboardPage();

      // Assert
      await waitFor(() => expect(screen.getByRole("main")).toBeInTheDocument());

      // Check for the UserMenu links
      const profileLink = screen.getByText("Profile").closest("a");
      expect(profileLink).toHaveAttribute(
        "href",
        expect.stringContaining("profile")
      );
      const ordersLink = screen.getByText("Orders").closest("a");
      expect(ordersLink).toHaveAttribute(
        "href",
        expect.stringContaining("orders")
      );
    });

    it("should render layout, footer and header correctly", async () => {
      // Act
      renderDashboardPage();

      // Assert
      await waitFor(() => expect(screen.getByRole("main")).toBeInTheDocument());

      // Check that the layout header is present
      expect(
        screen.getByText((content) => content.includes("Virtual Vault"))
      ).toBeInTheDocument();
      // Check that the user is logged in by looking for logout button
      expect(screen.getByText("Logout")).toBeInTheDocument();
      // Check that the layout footer is present
      expect(screen.getByText(/Privacy Policy/)).toBeInTheDocument();
    });

    afterEach(() => {
      localStorage.clear();
    });
  });
});
