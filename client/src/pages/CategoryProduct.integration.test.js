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

function renderCategoryProductPage(slug) {
  return render(
    <AuthProvider>
      <SearchProvider>
        <CartProvider>
          <MemoryRouter initialEntries={[`/category/${slug}`]}>
            <Toaster />
            <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/category/:slug" element={<CategoryProduct />} />
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

describe("Category Product Page Integration", () => {
  beforeEach(async () => {
    // ensure a clean storage between tests
    localStorage.clear();
    await resetSeedDatabase();
  });

  afterEach(async () => {
    localStorage.clear();
    await resetSeedDatabase();
  });

  describe("should render category products information and components when accessed", () => {
    it("should render products under the specific category", async () => {
      const categoryData = await seedCategoryData([testCategory1]);
      const productData = await seedProductData([
        { ...testProduct1, category: categoryData.categories[0]._id },
      ]);

      renderCategoryProductPage(testCategory1.slug);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Category/i })
        ).toBeInTheDocument();

        expect(screen.getByText(testProduct1.name)).toBeInTheDocument();
      });
    });

    it("should render 'No Products Found' when category has no products", async () => {
      await seedCategoryData([testCategory1]);

      renderCategoryProductPage(testCategory1.slug);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Category/i })
        ).toBeInTheDocument();

        expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
      });
    });

    it("should navigate to product details page when 'More Details' button is clicked", async () => {
      const categoryData = await seedCategoryData([testCategory1]);
      const productData = await seedProductData([
        { ...testProduct1, category: categoryData.categories[0]._id },
      ]);

      renderCategoryProductPage(testCategory1.slug);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Category/i })
        ).toBeInTheDocument();

        expect(screen.getByText(testProduct1.name)).toBeInTheDocument();
      });

      const moreDetailsButton = screen.getByRole("button", {
        name: /More Details/i,
      });
      moreDetailsButton.click();

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Product Details/i })
        ).toBeInTheDocument();

        const productElements = screen.getAllByText(/Test Product/i);
        expect(productElements[0]).toBeInTheDocument();
      });
    });

    it("should render layout, footer and header correctly", async () => {
      const categoryData = await seedCategoryData([testCategory1]);
      const productData = await seedProductData([
        { ...testProduct1, category: categoryData.categories[0]._id },
      ]);

      renderCategoryProductPage(testCategory1.slug);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Category/i })
        ).toBeInTheDocument();

        // Check that the layout header is present
        expect(
          screen.getByText((content) => content.includes("Virtual Vault"))
        ).toBeInTheDocument();
        // Check that the layout footer is present
        expect(screen.getByText(/Privacy Policy/)).toBeInTheDocument();
      });
    });

  });
});
