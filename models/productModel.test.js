// Below is the code for unit tests for productModel.js
// TODO: For integration tests, should use in-memory MongoDB server like mongodb-memory-server to validate schema behavior with actual DB operations

import mongoose from "mongoose";
import productModel from "./productModel.js";

describe("Product Model", () => {
  it("should create a product with min required fields", async () => {
    const validProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "This is a test product",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
    });
    await expect(validProduct.validate()).resolves.toBeUndefined();
    expect(validProduct.name).toBe("Test Product");
    expect(validProduct.slug).toBe("test-product");
    expect(validProduct.description).toBe("This is a test product");
    expect(validProduct.price).toBe(100);
    expect(validProduct.quantity).toBe(10);
    expect(validProduct.category).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(validProduct.shipping).toBeUndefined();
    // validProduct.photo is not undefined because Mongoose initializes the "photo" field as an empty object ({}).
    expect(validProduct.photo).toBeDefined();
    expect(validProduct.photo.data).toBeUndefined();
    expect(validProduct.photo.contentType).toBeUndefined();
  });

  it("should fail validation if required fields are missing", async () => {
    const invalidProduct = new productModel({});
    await expect(invalidProduct.validate()).rejects.toBeInstanceOf(
      mongoose.Error.ValidationError
    );
    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        name: expect.anything(),
        slug: expect.anything(),
        description: expect.anything(),
        price: expect.anything(),
        category: expect.anything(),
        quantity: expect.anything(),
      },
    });
  });

  it("should fail to create a product without name", async () => {
    const invalidProduct = new productModel({
      slug: "test-product",
      description: "Missing name",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        name: expect.objectContaining({
          kind: "required",
          path: "name",
        }),
      },
    });
  });

  it("should allow creating a product with photo and shipping", async () => {
    const validProduct = new productModel({
      name: "Test Product with Photo",
      slug: "test-product-photo",
      description: "This is a test product with photo",
      price: 150,
      category: new mongoose.Types.ObjectId(),
      quantity: 5,
      photo: {
        data: Buffer.from("abc"),
        contentType: "image/png",
      },
      shipping: true,
    });
    await expect(validProduct.validate()).resolves.toBeUndefined();
    expect(validProduct.name).toBe("Test Product with Photo");
    expect(validProduct.slug).toBe("test-product-photo");
    expect(validProduct.description).toBe("This is a test product with photo");
    expect(validProduct.price).toBe(150);
    expect(validProduct.quantity).toBe(5);
    expect(validProduct.category).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(validProduct.shipping).toBe(true);
    expect(validProduct.photo).toBeDefined();
    expect(Buffer.isBuffer(validProduct.photo.data)).toBe(true);
    expect(validProduct.photo.data.equals(Buffer.from("abc"))).toBe(true);
    expect(validProduct.photo.contentType).toBe("image/png");
  });
});