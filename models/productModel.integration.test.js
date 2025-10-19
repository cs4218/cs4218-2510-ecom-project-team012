// TODO: For integration tests, should use in-memory MongoDB server like mongodb-memory-server to validate schema behavior with actual DB operations
import productModel from "./productModel.js";
import categoryModel from "../models/categoryModel.js";
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../tests/setupTestDB.js";

// General structure generated with the help of AI

// Tested DB operations used of product model
// populate, findById, findByIdAndUpdate, findByIdAndDelete, estimatedDocumentCount

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
  category: testCategory1,
  quantity: 10,
};

describe("Product Model Integration", () => {
  // Setup for in-memory MongoDB
  beforeAll(async () => await connectTestDB(await createTestDB()));

  // Teardown for in-memory MongoDB
  afterEach(async () => await clearTestDB());
  afterAll(async () => await closeTestDB());

  it("should save a valid product created to the database", async () => {
    // Arrange
    // Using the category model to create a category for reference
    // Category id is a required field in product model
    const category = await categoryModel.create(testCategory1);
    // Create a valid product
    const product = new productModel({
      ...testProduct1,
      category: category._id,
    });

    // Act
    // Save the product to the in-memory database
    const savedProduct = await product.save();
    const found = await productModel.findById(savedProduct._id);

    // Assert
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe(testProduct1.name);
    expect(found).not.toBeNull();
    expect(found.price).toBe(testProduct1.price);
  });

  it("should populate category field when retrieving product", async () => {
    // Arrange
    const category = await categoryModel.create(testCategory1);
    const product = new productModel({
      ...testProduct1,
      category: category._id,
    });
    await product.save();

    // Act
    const foundProduct = await productModel
      .findById(product._id)
      .populate("category");

    // Assert
    expect(foundProduct).not.toBeNull();
    expect(foundProduct.category).toBeDefined();
    expect(foundProduct.category.name).toBe(testCategory1.name);
  });

  it("should mantain data consistency after update", async () => {
    // Arrange
    const category = await categoryModel.create(testCategory1);
    const product = new productModel({
      ...testProduct1,
      category: category._id,
    });
    await product.save();

    // Act
    const newPrice = 199.99;
    await productModel.findByIdAndUpdate(product._id, { price: newPrice });
    const updatedProduct = await productModel.findById(product._id);

    // Assert
    expect(updatedProduct).not.toBeNull();
    expect(updatedProduct.price).toBe(newPrice);
  });

  it("should handle product deletion correctly", async () => {
    // Arrange
    const category = await categoryModel.create(testCategory1);
    const product = new productModel({
      ...testProduct1,
      category: category._id,
    });
    await product.save();

    // Act
    await productModel.findByIdAndDelete(product._id);
    const deletedProduct = await productModel.findById(product._id);

    // Assert
    expect(deletedProduct).toBeNull();
  });

  it("should count products in the database with success", async () => {
    // Arrange
    const category = await categoryModel.create(testCategory1);
    const product1 = new productModel({
      ...testProduct1,
      category: category._id,
    });
    const product2 = new productModel({
      ...testProduct1,
      name: "Test Product 2",
      slug: "test-product-2",
      category: category._id,
    });
    await product1.save();
    await product2.save();

    // Act
    const productCount = await productModel.estimatedDocumentCount();

    // Assert
    expect(productCount).toBe(2);
  });

  it("should throw error when name and slug duplicates another product", async () => {
    // Arrange
    const category = await categoryModel.create(testCategory1);
    const product1 = new productModel({
      ...testProduct1,
      category: category._id,
    });
    const product2 = new productModel({
      ...testProduct1, // Duplicate
      category: category._id,
    });
    await product1.save();

    // Act & Assert
    await expect(product2.save()).rejects.toThrow();
  });

  it("should throw error when product name and slug is updated to duplicate another product", async () => {
    // Arrange
    const category = await categoryModel.create(testCategory1);
    const product1 = new productModel({
      ...testProduct1,
      category: category._id,
    });
    const product2 = new productModel({
      ...testProduct1,
      name: "Test Product 2",
      slug: "test-product-2",
      category: category._id,
    });

    await product1.save();
    await product2.save();

    // Act & Assert
    await expect(
      productModel.findByIdAndUpdate(product2._id, {
        name: testProduct1.name,
        slug: testProduct1.slug,
      })
    ).rejects.toThrow();
  });
});
