// TODO: For integration tests, should use in-memory MongoDB server like mongodb-memory-server to validate schema behavior with actual DB operations
import mongoose from "mongoose";
import productModel from "./productModel.js";

// General structure generated with the help of AI

describe("Product Model Integration", () => {
  it("should save a valid product to the database", async () => {
    const product = new productModel({
      name: "Integration Product",
      slug: "integration-product",
      description: "Testing DB integration",
      price: 50,
      category: new mongoose.Types.ObjectId(),
      quantity: 20,
      shipping: true,
    });

    const savedProduct = await product.save();
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe("Integration Product");

    const found = await productModel.findById(savedProduct._id);
    expect(found).not.toBeNull();
    expect(found.price).toBe(50);
  });

  it("should fail to save when price is negative", async () => {
    const invalidProduct = new productModel({
      name: "Invalid Product",
      slug: "invalid-product",
      description: "Negative price",
      price: -100,
      category: new mongoose.Types.ObjectId(),
      quantity: 5,
    });

    await expect(invalidProduct.save()).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });
});
