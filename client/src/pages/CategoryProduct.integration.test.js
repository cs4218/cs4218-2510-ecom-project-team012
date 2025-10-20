import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/auth";
import CategoryProduct from "./CategoryProduct";
import ProductDetails from "./ProductDetails";
import Pagenotfound from "./Pagenotfound";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";
import { resetSeedDatabase, seedCategoryData, seedProductData } from "../setupSeedDataRoutes";

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
              <Route path="*" element={<Pagenotfound />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

const testCategory1 = {
  _id: "64a7f0f2b4dcb5e5f6a1c123",
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
  category: testCategory1._id,
};  

describe("Category Product Page Integration", () => {
  beforeEach(async () => {
    // ensure a clean storage between tests
    localStorage.clear();
    await resetSeedDatabase();
    await seedCategoryData([testCategory1]);
  });

  afterEach(async () => {
    localStorage.clear();
    await resetSeedDatabase();
  });

  describe("should render category products information and components when accessed", () => {
    it("should render category product page title", async () => {
      await seedProductData([testProduct1]);

      renderCategoryProductPage(testCategory1.slug);

      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: /Category/i })
        ).toBeInTheDocument()
      );
    });
  });
});

