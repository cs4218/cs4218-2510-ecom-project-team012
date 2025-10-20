import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/auth";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";
import {
  resetSeedDatabase,
  seedCategoryData,
  seedProductData,
} from "../setupSeedDataRoutes";
import Login from "./Auth/Login";

// General structure generated with the help of AI

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

function renderCartPage() {
  return render(
    <AuthProvider>
      <SearchProvider>
        <CartProvider>
          <MemoryRouter initialEntries={[`/product/${slug}`]}>
            <Toaster />
            <Routes>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

describe("Cart Page Integration", () => {
  beforeEach(async () => {
    // ensure a clean storage between tests
    localStorage.clear();
    await resetSeedDatabase();
  });

  afterEach(async () => {
    localStorage.clear();
  });

  describe("should render cart page information and components", () => {
    it("should render cart page title", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Your Cart/i })
        ).toBeInTheDocument();
      });
    });

    it("should render layout, footer and header correctly", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        // Check for header elements
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
        expect(screen.getByText(/Categories/i)).toBeInTheDocument();
        expect(screen.getByText(/Cart/i)).toBeInTheDocument();

        // Check for footer elements
        expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
      });
    });
  });

  describe("should handle when cart has items", () => {
    beforeEach(async () => {
      // Put cart data in localStorage so CartProvider picks it up
      const categoryData = await seedCategoryData([testCategory1]);
      const productData = await seedProductData([
        { ...testProduct1, category: categoryData.categories[0]._id },
      ]);
      localStorage.setItem(
        "cart",
        JSON.stringify([
          { ...testProduct1, category: categoryData.categories[0]._id },
        ])
      );
    });

    it("should render cart item in the cart", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(testProduct1.name)).toBeInTheDocument();
        expect(screen.getByText(/1 items in your cart/i)).toBeInTheDocument();
        expect(
          screen.getByText(`$${testProduct1.price.toFixed(2)}`)
        ).toBeInTheDocument();
      });
    });

    it("should render total price correctly", async () => {
      // Add item to cart
      const categoryData = await seedCategoryData([
        {
          ...testCategory1,
          name: "Test Category 2",
          slug: "test-category-slug-2",
        },
      ]);
      const productData = await seedProductData([
        {
          ...testProduct1,
          name: "Test Product 2",
          slug: "test-product-2",
          price: 50,
          category: categoryData.categories[0]._id,
        },
      ]);
      // Get current cart from localStorage
      const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
      // Add new item to cart
      currentCart.push({
        ...testProduct1,
        name: "Test Product 2",
        slug: "test-product-2",
        category: categoryData.categories[0]._id,
      });
      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(currentCart));

      renderCartPage();

      // Assert
      await waitFor(() => {
        const totalPrice = testProduct1.price + 50;
        expect(
          screen.getByText(
            new RegExp(`Total: \\$${totalPrice.toFixed(2)}`, "i")
          )
        ).toBeInTheDocument();
      });
    });

    it("should render remove item button", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Remove/i })
        ).toBeInTheDocument();
      });
    });

    it("should remove item from cart when remove button is clicked", async () => {
      renderCartPage();

      // Act
      const removeButton = await screen.findByRole("button", {
        name: /Remove/i,
      });
      removeButton.click();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/Your cart is currently empty/i)
        ).toBeInTheDocument();
      });
    });

    it("should handle duplicate items in cart and calculate total price correctly", async () => {
      // Add duplicate item to cart
      const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
      currentCart.push(currentCart[0]); // duplicate the first item
      localStorage.setItem("cart", JSON.stringify(currentCart));

      renderCartPage();

      // Assert
      await waitFor(() => {
        const totalPrice = testProduct1.price * 2;
        expect(
          screen.getByText(
            new RegExp(`Total: \\$${totalPrice.toFixed(2)}`, "i")
          )
        ).toBeInTheDocument();
        expect(screen.getByText(/2 items in your cart/i)).toBeInTheDocument();
      });
    });
  });

  describe("should handle when user is not authenticated and cart is empty", () => {
    it("should render empty cart message", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/Your cart is currently empty/i)
        ).toBeInTheDocument();
      });
    });

    it("should greet user as Guest", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Hello Guest/i)).toBeInTheDocument();
      });
    });

    it("should have login button", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        const loginButton = screen.getByRole("button", { name: /Login/i });
        expect(loginButton).toBeInTheDocument();
      });
    });

    it("should navigate to login page when login button is clicked", async () => {
      renderCartPage();

      // Act
      const loginButton = await screen.findByRole("button", { name: /Login/i });
      loginButton.click();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Login/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("should handle when user is not authenticated and cart has items", () => {
    beforeEach(async () => {
      // Put cart data in localStorage so CartProvider picks it up
      const categoryData = await seedCategoryData([testCategory1]);
      const productData = await seedProductData([
        { ...testProduct1, category: categoryData.categories[0]._id },
      ]);
      localStorage.setItem(
        "cart",
        JSON.stringify([
          { ...testProduct1, category: categoryData.categories[0]._id },
        ])
      );
    });
    it("should greet user as Guest", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Hello Guest/i)).toBeInTheDocument();
      });
    });

    it("should prompt user to login to checkout", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/please login to checkout !/i)
        ).toBeInTheDocument();
      });
    });

    it("should have login button", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        const loginButton = screen.getByRole("button", { name: /Login/i });
        expect(loginButton).toBeInTheDocument();
      });
    });
  });

  describe("should handle when user is authenticated and cart has items", () => {
    beforeEach(async () => {
      // Put authenticated user data in localStorage so AuthProvider picks it up
      localStorage.setItem(
        "auth",
        JSON.stringify({ user: testUser1, token: testAuthToken })
      );
      // Put cart data in localStorage so CartProvider picks it up
      const categoryData = await seedCategoryData([testCategory1]);
      const productData = await seedProductData([
        { ...testProduct1, category: categoryData.categories[0]._id },
      ]);
      localStorage.setItem(
        "cart",
        JSON.stringify([
          { ...testProduct1, category: categoryData.categories[0]._id },
        ])
      );
    });

    it("should greet user by name", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`Hello  ${testUser1.name}`, "i"))
        ).toBeInTheDocument();
      });
    });

    it("should render current address and update address button", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`Address: ${testUser1.address}`, "i"))
        ).toBeInTheDocument();
        const updateAddressButton = screen.getByRole("button", {
          name: /Update Address/i,
        });
        expect(updateAddressButton).toBeInTheDocument();
      });
    });

    it("should not render current address if user address is empty", async () => {
      // Update user address to empty
      const authData = {
        user: { ...testUser1, address: "" },
        token: testAuthToken,
      };
      localStorage.setItem("auth", JSON.stringify(authData));

      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByText(new RegExp(`Address: ${testUser1.address}`, "i"))
        ).not.toBeInTheDocument();
      });
    });

    it("should navigate to profile page when update address button is clicked", async () => {
      renderCartPage();

      // Act
      const updateAddressButton = await screen.findByRole("button", {
        name: /Update Address/i,
      });
      updateAddressButton.click();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Profile/i })
        ).toBeInTheDocument();
      });
    });

    it("should render payment button", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        const paymentButton = screen.getByRole("button", {
          name: /Make Payment/i,
        });
        expect(paymentButton).toBeInTheDocument();
      });
    });
  });

  describe("should handle when user is authenticated and cart is empty", () => {
    beforeEach(() => {
      // Put authenticated user data in localStorage so AuthProvider picks it up
      localStorage.setItem(
        "auth",
        JSON.stringify({ user: testUser1, token: testAuthToken })
      );
    });

    it("should greet user by name", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`Hello  ${testUser1.name}`, "i"))
        ).toBeInTheDocument();
      });
    });

    it("should render empty cart message", async () => {
      renderCartPage();

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/Your cart is currently empty/i)
        ).toBeInTheDocument();
      });
    });
  });
});
