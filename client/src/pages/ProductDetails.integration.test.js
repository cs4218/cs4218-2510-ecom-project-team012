import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/auth";
import ProductDetails from "./ProductDetails";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";
import {
  resetSeedDatabase,
  seedCategoryData,
  seedProductData,
} from "../setupSeedDataRoutes";

// General structure generated with the help of AI

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

function renderProductDetailsPage(slug) {
  return render(
    <AuthProvider>
      <SearchProvider>
        <CartProvider>
          <MemoryRouter initialEntries={[`/product/${slug}`]}>
            <Toaster />
            <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

const testCategory1 = {
  name: "Test Category",
  slug: "test-category-slug",
  description: "This is a test category for integration testing.",
};

const testProduct1 = {
  name: "Test Product",
  slug: "test-product-slug",
  description: "This is a test product for integration testing.",
  price: 99.99,
  quantity: 10,
};

describe("Product Details Page Integration", () => {
  beforeEach(async () => {
    // ensure a clean storage between tests
    localStorage.clear();
    await resetSeedDatabase();
  });

  afterEach(async () => {
    localStorage.clear();
  });

  it("should render product details page with correct product info", async () => {
    const categoryData = await seedCategoryData([testCategory1]);
    const productData = await seedProductData([
      { ...testProduct1, category: categoryData.categories[0]._id },
    ]);

    renderProductDetailsPage(testProduct1.slug);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Product Details/i })
      ).toBeInTheDocument();
      screen.getByText((content) => content.includes(testProduct1.name));
      screen.getByText((content) => content.includes(testProduct1.description));
      screen.getByText((content) =>
        content.includes(`$${testProduct1.price.toFixed(2)}`)
      );
    });
  });

  it("should show 'Add to Cart' button on product details page", async () => {
    const categoryData = await seedCategoryData([testCategory1]);
    const productData = await seedProductData([
      { ...testProduct1, category: categoryData.categories[0]._id },
    ]);

    renderProductDetailsPage(testProduct1.slug);

    // Assert
    await waitFor(() => {
      const addToCartButton = screen.getByRole("button", {
        name: /Add to Cart/i,
      });
      expect(addToCartButton).toBeInTheDocument();
    });
  });

  it("should disable 'Add to Cart' button when product is out of stock", async () => {
    const categoryData = await seedCategoryData([testCategory1]);
    const productData = await seedProductData([
      {
        ...testProduct1,
        category: categoryData.categories[0]._id,
        quantity: 0,
      },
    ]);

    renderProductDetailsPage(testProduct1.slug);

    // Assert
    await waitFor(() => {
      const soldOutButton = screen.getByRole("button", {
        name: /SOLD OUT/i,
      });
      expect(soldOutButton).toBeDisabled();
    });
  });

  it("should update cart and localStorage when 'Add to Cart' button is clicked and toast is shown", async () => {
    const categoryData = await seedCategoryData([testCategory1]);
    const productData = await seedProductData([
      { ...testProduct1, category: categoryData.categories[0]._id },
    ]);

    renderProductDetailsPage(testProduct1.slug);

    // Act
    const addToCartButton = await screen.findByRole("button", {
      name: /Add to Cart/i,
    });

    await act(async () => {
      addToCartButton.click();
    });

    // Assert
    await waitFor(() => {
      const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      expect(cartItems.length).toBe(1);
      // Check for toast notification
      const toasts = screen.getAllByText(/Item Added to cart/i);
      expect(toasts.length).toBeGreaterThan(0);
      // Check that cart badge is updated
      const cartBadge = screen.getByText("1");
      expect(cartBadge).toBeInTheDocument();
    });
  });

  it("should show similar products section on product details page", async () => {
    const categoryData = await seedCategoryData([testCategory1]);
    const productData = await seedProductData([
      { ...testProduct1, category: categoryData.categories[0]._id },
      {...testProduct1, name: "Product 2", slug: "product-2-slug", category: categoryData.categories[0]._id },
    ]);

    renderProductDetailsPage(testProduct1.slug);

    // Assert
    await waitFor(() => {
      const similarProductsHeading = screen.getByRole("heading", {
        name: /Similar Products/i,
      });
      expect(similarProductsHeading).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes("Product 2"))
      ).toBeInTheDocument();
    });
  });

  it("should show 'No Similar Products found' when there are no related products", async () => {
    const categoryData = await seedCategoryData([testCategory1]);
    const productData = await seedProductData([
      { ...testProduct1, category: categoryData.categories[0]._id },
    ]);

    renderProductDetailsPage(testProduct1.slug);

    // Assert
    await waitFor(() => {
      const noSimilarProductsMessage = screen.getByText(
        /No Similar Products found/i
      );
      expect(noSimilarProductsMessage).toBeInTheDocument();
    });
  });

  it("should navigate to similar product's details page when 'More Details' button is clicked", async () => {
    const categoryData = await seedCategoryData([testCategory1]);
    const productData = await seedProductData([
      { ...testProduct1, category: categoryData.categories[0]._id },
      {...testProduct1, name: "Product 2", slug: "product-2-slug", category: categoryData.categories[0]._id },
    ]);

    renderProductDetailsPage(testProduct1.slug);

    // Act
    const moreDetailsButton = await screen.findByRole("button", {
      name: /More Details/i,
    });

    await act(async () => {
      moreDetailsButton.click();
    });

    // Assert
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Product Details/i })
      ).toBeInTheDocument();
      screen.getByText((content) => content.includes("Product 2"));
    });
  });
});
