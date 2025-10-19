import request from "supertest";
import app from "../server.js";
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../tests/setupTestDB.js";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import { ca } from "date-fns/locale";

// ---------------------------------------------

// Megan's Integration Tests for
// 1. getProductController
// 2. getSingleProductController
// 3. productPhotoController
// 4. productFiltersController
// 5. productCountController
// 6. productListController
// 7. searchProductController
// 8. realtedProductController
// 9. productCategoryController

// General structure generated with the help of AI

const testCategory1 = {
  name: "TestCategory",
  slug: "test-category",
  description: "This is a test category",
};

const testProduct1 = {
  name: "Test Product 1",
  slug: "test-product-1",
  description: "Description1",
  price: 159.3,
  quantity: 10,
};

const testProduct2 = {
  name: "Test Product 2",
  slug: "test-product-2",
  description: "Description2",
  price: 99.99,
  quantity: 5,
};

describe("Product Controller Integration", () => {
  // Setup for in-memory MongoDB
  beforeAll(async () => await connectTestDB(await createTestDB()));

  // Teardown for in-memory MongoDB
  afterEach(async () => await clearTestDB());
  afterAll(async () => await closeTestDB());

  describe("GET /api/v1/product/get-product", () => {
    it("should retrieve all products", async () => {
      // Arrange
      const category = await categoryModel.create(testCategory1);
      await productModel.create({
        ...testProduct1,
        category: category._id,
      });
      await productModel.create({
        ...testProduct2,
        category: category._id,
      });

      // Act
      const res = await request(app).get("/api/v1/product/get-product");

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("products");
      expect(res.body.products.length).toBe(2);
      const products = res.body.products;
      // expect products to contain both testProduct1 and testProduct2 with populated category field
      expect(products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: testProduct1.name, category: expect.objectContaining({ _id: category._id.toString() }) }),
          expect.objectContaining({ name: testProduct2.name, category: expect.objectContaining({ _id: category._id.toString() }) }),
        ])
      );
      // expect product photo to be undefined
        expect(products[0].photo).toBeUndefined();
        expect(products[1].photo).toBeUndefined();
      // expect sorting of products where product2 comes before product1 (based on createdAt descending)
      expect(products[0].name).toBe(testProduct2.name);
      expect(products[1].name).toBe(testProduct1.name);
    });
  });
});
