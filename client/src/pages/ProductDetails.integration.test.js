import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/auth";
import CategoryProduct from "./CategoryProduct";
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
  _id: "64a7f1a2b4dcb5e5f6a1c456",
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

  describe("should render product details information and components when accessed", () => {
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
        screen.getByText((content) =>
          content.includes(testProduct1.description)
        );
        screen.getByText((content) =>
          content.includes(`$${testProduct1.price.toFixed(2)}`)
        );
      });
    });
  });
});
