import mongoose from "mongoose";
import productModel from "./productModel.js";

// General structure generated with the help of AI
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

  it("should fail to create a product without slug", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      description: "Missing slug",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        slug: expect.objectContaining({
          kind: "required",
          path: "slug",
        }),
      },
    });
  });

  it("should fail to create a product without description", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        description: expect.objectContaining({
          kind: "required",
          path: "description",
        }),
      },
    });
  });

  it("should fail to create a product without price", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "Missing price",
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        price: expect.objectContaining({
          kind: "required",
          path: "price",
        }),
      },
    });
  });

  it("should fail to create a product without category", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "Missing category",
      price: 100,
      quantity: 10,
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        category: expect.objectContaining({
          kind: "required",
          path: "category",
        }),
      },
    });
  });

  it("should fail to create a product without quantity", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "Missing quantity",
      price: 100,
      category: new mongoose.Types.ObjectId(),
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        quantity: expect.objectContaining({
          kind: "required",
          path: "quantity",
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

  it("should fail to create a product with invalid category type", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "Invalid category type",
      price: 100,
      category: "not-an-object-id",
      quantity: 10,
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        category: expect.objectContaining({
          name: "CastError",
          kind: "ObjectId",
          path: "category",
        }),
      },
    });
  });

  it("should fail to create a product with negative price", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "Negative price",
      price: -50,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        price: expect.objectContaining({
          name: "ValidatorError",
          kind: "min",
          path: "price",
        }),
      },
    });
  });

  it("should fail to create a product with negative quantity", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "Negative quantity",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: -5,
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        quantity: expect.objectContaining({
          name: "ValidatorError",
          kind: "min",
          path: "quantity",
        }),
      },
    });
  });

  it("should fail to create a product with invalid price type", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "Invalid price type",
      price: "not-a-number",
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        price: expect.objectContaining({
          name: "CastError",
          kind: "Number",
          path: "price",
        }),
      },
    });
  });

  it("should fail to create a product with invalid quantity type", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "Invalid quantity type",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: "not-a-number",
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        quantity: expect.objectContaining({
          name: "CastError",
          kind: "Number",
          path: "quantity",
        }),
      },
    });
  });

  it("should fail to create a product with invalid boolean shipping type", async () => {
    const invalidProduct = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "Invalid shipping type",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      shipping: "not-a-boolean",
    });

    await expect(invalidProduct.validate()).rejects.toMatchObject({
      errors: {
        shipping: expect.objectContaining({
          name: "CastError",
          kind: "Boolean",
          path: "shipping",
        }),
      },
    });
  });
});