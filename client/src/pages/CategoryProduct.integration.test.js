import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  resetSeedDatabase,
  seedCategoryData,
  seedProductData,
} from "../setupSeedDataRoutes";

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

import "@testing-library/jest-dom/extend-expect";
import ProductDetails from "./ProductDetails";
import CategoryProduct from "./CategoryProduct";
import Pagenotfound from "./Pagenotfound";
import { AuthProvider } from "../context/auth";
import { SearchProvider } from "../context/search";
import { CartProvider } from "../context/cart";
import { Toaster } from "react-hot-toast";

// General structure generated with the help of AI

const testCategory = {
  _id: "68e3f943282387623f0a0737",
  name: "Electronics",
  slug: "electronics",
};

const testProduct = {
  name: "Smartphone",
  slug: "smartphone",
  description: "A cool smartphone",
  category: testCategory._id,
  price: 699,
  quantity: 50,
};

beforeAll(async () => {
  // Reset + Seed test DB before running
  await resetSeedDatabase();
  await seedCategoryData([testCategory]);
  await seedProductData([{ ...testProduct }]);
});

describe("CategoryProduct Page Integration", () => {
  it("renders category name and products from backend", async () => {
    // Render the page for the Electronics category
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[`/category/${testCategory.slug}`]}>
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

    // Wait for category name to appear (backend call resolves)
    const categoryName = await screen.findByText(/Category - Electronics/i);
    expect(categoryName).toBeInTheDocument();

    // Ensure products are loaded
    const products = await screen.findAllByRole("img"); // images of product cards
    expect(products.length).toBeGreaterThan(0);

    // Product count text
    const count = await screen.findByText(/result found/i);
    expect(count).toHaveTextContent(/result found/i);
  });
});
