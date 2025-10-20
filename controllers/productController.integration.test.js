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

const testCategory2 = {
  name: "AnotherCategory",
  slug: "another-category",
  description: "This is another test category",
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

// Integration of Backend Controllers to API Endpoints

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
          expect.objectContaining({
            name: testProduct1.name,
            category: expect.objectContaining({ _id: category._id.toString() }),
          }),
          expect.objectContaining({
            name: testProduct2.name,
            category: expect.objectContaining({ _id: category._id.toString() }),
          }),
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

  describe("GET /api/v1/product/get-product/:slug", () => {
    it("should retrieve a single product by slug", async () => {
      // Arrange
      const category = await categoryModel.create(testCategory1);
      await productModel.create({
        ...testProduct1,
        category: category._id,
      });

      // Act
      const res = await request(app).get(
        `/api/v1/product/get-product/${testProduct1.slug}`
      );

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("product");
      expect(res.body.product.name).toBe(testProduct1.name);
      // expect populated category field
      expect(res.body.product.category).toHaveProperty(
        "_id",
        category._id.toString()
      );
      // expect product photo to be undefined
      expect(res.body.product.photo).toBeUndefined();
    });

    it("should return 404 for non-existent product slug", async () => {
      // Act
      const res = await request(app).get(
        `/api/v1/product/get-product/non-existent-slug`
      );

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        expect.stringMatching(/not found/i)
      );
    });
  });

  describe("GET /api/v1/product/product-photo/:productId", () => {
    it("should retrieve product photo", async () => {
      // Arrange
      const category = await categoryModel.create(testCategory1);
      const photoData = Buffer.from("TestPhotoData");
      const product = await productModel.create({
        ...testProduct1,
        category: category._id,
        photo: {
          data: photoData,
          contentType: "image/png",
        },
      });

      // Act
      const res = await request(app).get(
        `/api/v1/product/product-photo/${product._id}`
      );

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toBe("image/png");
      expect(res.body).toEqual(photoData);
    });

    it("should return 404 for non-existent product ID", async () => {
      // Act
      const res = await request(app).get(
        `/api/v1/product/product-photo/610c5f4f4f1a25630c8b4567` // some random ObjectId
      );

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        expect.stringMatching(/not found/i)
      );
    });

    it("should return 404 for products with no photo", async () => {
      // Arrange
      const category = await categoryModel.create(testCategory1);
      const product = await productModel.create({
        ...testProduct1,
        category: category._id,
      });

      // Act
      const res = await request(app).get(
        `/api/v1/product/product-photo/${product._id}`
      );

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        expect.stringMatching(/not found/i)
      );
    });
  });

  describe("POST /api/v1/product/product-filters", () => {
    it("should filter products based on category and price range", async () => {
      // Arrange
      const category1 = await categoryModel.create(testCategory1);
      const category2 = await categoryModel.create(testCategory2);
      await productModel.create({
        ...testProduct1,
        category: category1._id,
        price: 150,
      });
      await productModel.create({
        ...testProduct2,
        category: category2._id,
        price: 150,
      });
      await productModel.create({
        ...testProduct2,
        name: "Test Product 3",
        slug: "test-product-3",
        category: category1._id,
        price: 250,
      });

      // Act
      const filterCriteria = {
        checked: [category1._id],
        radio: [100, 200],
      };
      const res = await request(app)
        .post("/api/v1/product/product-filters")
        .send(filterCriteria);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("products");
      expect(res.body.products.length).toBe(1);
      const products = res.body.products;
      expect(products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: testProduct1.name,
            category: category1._id.toString(),
          }),
        ])
      );
    });

    it("should return all products when no filters are applied", async () => {
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
      const filterCriteria = {
        checked: [],
        radio: [],
      };
      const res = await request(app)
        .post("/api/v1/product/product-filters")
        .send(filterCriteria);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("products");
      expect(res.body.products.length).toBe(2);
    });

    it("should return empty array when no products match filters", async () => {
      // Arrange
      const category = await categoryModel.create(testCategory1);
      await productModel.create({
        ...testProduct1,
        category: category._id,
        price: 300,
      });
      await productModel.create({
        ...testProduct2,
        category: category._id,
        price: 400,
      });

      // Act
      const filterCriteria = {
        checked: [category._id],
        radio: [100, 200],
      };
      const res = await request(app)
        .post("/api/v1/product/product-filters")
        .send(filterCriteria);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("products");
      expect(res.body.products.length).toBe(0);
    });

    it("should handle invalid filter input gracefully", async () => {
      // Arrange
      const category = await categoryModel.create(testCategory1);
      await productModel.create({
        ...testProduct1,
        category: category._id,
      });

      // Act
      const filterCriteria = {
        checked: "invalid-category-id", // should be an array
        radio: "invalid-price-range", // should be an array
      };
      const res = await request(app)
        .post("/api/v1/product/product-filters")
        .send(filterCriteria);

      // Assert
      expect(res.body).toHaveProperty("message");
      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/product/product-count", () => {
    it("should return the total count of products", async () => {
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
      const res = await request(app).get("/api/v1/product/product-count");

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("total", 2);
    });
  });

  describe("GET /api/v1/product/product-list/:page", () => {
    it("should return list of products limit of 6", async () => {
      // Arrange
      const category = await categoryModel.create(testCategory1);
      for (let i = 1; i <= 10; i++) {
        await productModel.create({
          ...testProduct1,
          name: `Test Product ${i}`,
          slug: `test-product-${i}`,
          description: `Description${i}`,
          category: category._id,
        });
      }

      // Act
      const resPage1 = await request(app).get("/api/v1/product/product-list/1");

      // Assert
      expect(resPage1.statusCode).toBe(200);
      expect(resPage1.body).toHaveProperty("products");
      expect(resPage1.body.products.length).toBe(6); // 6 products per page

      // Check that the products are the last 6 created
      const products = resPage1.body.products;
      const expectedItems = [];
      for (let i = 10; i >= 5; i--) {
        expectedItems.push(
          expect.objectContaining({ name: `Test Product ${i}` })
        );
      }
      expect(products).toEqual(expect.arrayContaining(expectedItems));

      // ensure no photo field is included
      products.forEach((product) => {
        expect(product.photo).toBeUndefined();
      });
    });

    it("should return list of products in the next page", async () => {
      // Arrange
      const category = await categoryModel.create(testCategory1);
      for (let i = 1; i <= 10; i++) {
        await productModel.create({
          ...testProduct1,
          name: `Test Product ${i}`,
          slug: `test-product-${i}`,
          description: `Description${i}`,
          category: category._id,
        });
      }

      // Act
      const resPage2 = await request(app).get("/api/v1/product/product-list/2");

      // Assert
      expect(resPage2.statusCode).toBe(200);
      expect(resPage2.body).toHaveProperty("products");
      expect(resPage2.body.products.length).toBe(4); // remaining 4 products (10 total - 6 on first page)

      // Check that the products are the correct ones for page 2
      const products = resPage2.body.products;
      const expectedItems = [];
      for (let i = 4; i >= 1; i--) {
        expectedItems.push(
          expect.objectContaining({ name: `Test Product ${i}` })
        );
      }
      expect(products).toEqual(expect.arrayContaining(expectedItems));

      // ensure no photo field is included
      products.forEach((product) => {
        expect(product.photo).toBeUndefined();
      });
    });

    it("should handle error for invalid page number", async () => {
      // Act
      const res = await request(app).get(
        "/api/v1/product/product-list/invalid-page"
      );

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        expect.stringMatching(/invalid page number/i)
      );
    });
  });

  describe("GET /api/v1/product/search/:keyword", () => {
    it("should return products with name matching the search keyword", async () => {
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
      const keyword = "Test Product 1";

      // Act
      const res = await request(app).get(`/api/v1/product/search/${keyword}`);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      const products = res.body;
      expect(products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: testProduct1.name }),
        ])
      );
    });

    it("should return products with description matching the search keyword", async () => {
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
      const keyword = "Description2";

      // Act
      const res = await request(app).get(`/api/v1/product/search/${keyword}`);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      const products = res.body;
      expect(products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: testProduct2.name }),
        ])
      );
    });

    it("should handle error when white space keyword is provided", async () => {
      // Act
      const res = await request(app).get(`/api/v1/product/search/%20`);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        expect.stringMatching(/keyword is required/i)
      );
    });

    describe("GET /api/v1/product/related-product/:productId/:categoryId", () => {
      it("should return related products based on category", async () => {
        // Arrange
        const category = await categoryModel.create(testCategory1);
        const product1 = await productModel.create({
          ...testProduct1,
          category: category._id,
        });
        const product2 = await productModel.create({
          ...testProduct2,
          category: category._id,
        });

        // Act
        const res = await request(app).get(
          `/api/v1/product/related-product/${product1._id}/${category._id}`
        );

        // Assert
        expect(res.statusCode).toBe(200);
        expect(res.body.products.length).toBe(1);
        const products = res.body.products;
        expect(products).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: product2.name, category:expect.objectContaining({ _id: category._id.toString() }) }),
          ])
        );
        // should not return the original product
        products.forEach((prod) => {
          expect(prod._id.toString()).not.toBe(product1._id.toString());
        });
      });

      it("should handle error for non-existent product ID", async () => {
        // Arrange
        const category = await categoryModel.create(testCategory1);

        // Act
        const res = await request(app).get(
          `/api/v1/product/related-product/invalid/${category._id}`
        );

        // Assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty(
          "message",
          expect.stringMatching(/error/i)
        );
      });

      it("should handle error for non-existent category ID", async () => {
        // Arrange
        const product = await productModel.create({
          ...testProduct1,
          category: (await categoryModel.create(testCategory1))._id,
        });

        // Act
        const res = await request(app).get(
          `/api/v1/product/related-product/${product._id}/invalid`
        );

        // Assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty(
          "message",
          expect.stringMatching(/error/i)
        );
      });
    });
  });

  describe("GET /api/v1/product/product-category/:slug", () => {
    it("should return products for a given category slug", async () => {
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
      const res = await request(app).get(
        `/api/v1/product/product-category/${category.slug}`
      );

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("category");
      expect(res.body).toHaveProperty("products");
      expect(res.body.category).toHaveProperty("slug", category.slug);
      expect(res.body.products.length).toBe(2);
    });

    it("should return 404 for non-existent category slug", async () => {
      // Act
      const res = await request(app).get(
        `/api/v1/product/product-category/non-existent-slug`
      );

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        expect.stringMatching(/category not found/i)
      );
    });
  });
});
