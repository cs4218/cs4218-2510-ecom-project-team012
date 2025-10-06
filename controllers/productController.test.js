import {
  createProductController,
  deleteProductController,
  updateProductController,
} from "./productController.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import fs from "fs";

// General structure generated with the help of AI

jest.mock("../models/productModel.js");
jest.mock("../models/categoryModel.js");
jest.mock("fs");

const mockCategory1 = {
  _id: "mock-category-id",
  name: "MockCategory",
  slug: "mock-category",
  description: "This is a mock category",
};

const mockProduct1 = {
  _id: "mock-product-1",
  name: "Product1",
  slug: "mock-product-1",
  description: "Description1",
  price: 159.3,
  category: mockCategory1,
  quantity: 10,
  createdAt: new Date(),
};

const mockProduct2 = {
  _id: "mock-product-2",
  name: "Product2",
  slug: "mock-product-2",
  description: "Description2",
  price: 200,
  category: mockCategory1,
  quantity: 20,
  photo: { data: Buffer.from("mock-image-data"), contentType: "image/png" },
  shipping: true,
  createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour earlier from now
};

describe("createProductController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      fields: {},
      files: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should create a product successfully without photo", async () => {
    // Arrange
    req.fields = {
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: mockCategory1._id,
      quantity: 10,
      shipping: false,
    };
    req.files = {};

    const mockSavedProduct = {
      ...req.fields,
      slug: "Test-Product",
      _id: "new-product-id",
      photo: { data: null, contentType: null },
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.mockImplementation(() => mockSavedProduct);

    // Act
    await createProductController(req, res);

    // Assert
    expect(productModel).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Product",
        slug: "Test-Product",
      })
    );
    expect(mockSavedProduct.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Product Created Successfully",
        products: mockSavedProduct,
      })
    );
  });

  it("should create a product successfully with photo", async () => {
    // Arrange
    req.fields = {
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: mockCategory1._id,
      quantity: 10,
      shipping: false,
    };
    req.files = {
      photo: {
        path: "/mock/path/to/photo.jpg",
        type: "image/jpeg",
        size: 500000, // 500KB
      },
    };

    const mockPhotoData = Buffer.from("mock-photo-data");
    fs.readFileSync.mockReturnValue(mockPhotoData);

    const mockSavedProduct = {
      ...req.fields,
      slug: "Test-Product",
      _id: "new-product-id",
      photo: { data: null, contentType: null },
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.mockImplementation(() => mockSavedProduct);

    // Act
    await createProductController(req, res);

    // Assert
    expect(fs.readFileSync).toHaveBeenCalledWith("/mock/path/to/photo.jpg");
    expect(mockSavedProduct.photo.data).toBe(mockPhotoData);
    expect(mockSavedProduct.photo.contentType).toBe("image/jpeg");
    expect(mockSavedProduct.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Product Created Successfully",
      })
    );
  });

  it("should return 500 error when name is missing", async () => {
    // Arrange
    req.fields = {
      description: "Test Description",
      price: 100,
      category: mockCategory1._id,
      quantity: 10,
    };

    // Act
    await createProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  it("should return 500 error when description is missing", async () => {
    // Arrange
    req.fields = {
      name: "Test Product",
      price: 100,
      category: mockCategory1._id,
      quantity: 10,
    };

    // Act
    await createProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
  });

  it("should return 500 error when price is missing", async () => {
    // Arrange
    req.fields = {
      name: "Test Product",
      description: "Test Description",
      category: mockCategory1._id,
      quantity: 10,
    };

    // Act
    await createProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
  });

  it("should return 500 error when category is missing", async () => {
    // Arrange
    req.fields = {
      name: "Test Product",
      description: "Test Description",
      price: 100,
      quantity: 10,
    };

    // Act
    await createProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
  });

  it("should return 500 error when quantity is missing", async () => {
    // Arrange
    req.fields = {
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: mockCategory1._id,
    };

    // Act
    await createProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
  });

  it("should return 500 error when photo size exceeds 1MB", async () => {
    // Arrange
    req.fields = {
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: mockCategory1._id,
      quantity: 10,
    };
    req.files = {
      photo: {
        path: "/mock/path/to/photo.jpg",
        type: "image/jpeg",
        size: 2000000, // 2MB - exceeds limit
      },
    };

    // Act
    await createProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "photo is Required and should be less then 1mb",
    });
  });

  it("should handle errors during product creation", async () => {
    // Arrange
    req.fields = {
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: mockCategory1._id,
      quantity: 10,
    };
    req.files = {};

    const error = new Error("Database error");
    productModel.mockImplementation(() => {
      throw error;
    });

    // Act
    await createProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error,
      message: "Error in crearing product",
    });
  });

  it("should handle errors during save", async () => {
    // Arrange
    req.fields = {
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: mockCategory1._id,
      quantity: 10,
    };
    req.files = {};

    const error = new Error("Save error");
    const mockSavedProduct = {
      ...req.fields,
      slug: "Test-Product",
      photo: { data: null, contentType: null },
      save: jest.fn().mockRejectedValue(error),
    };

    productModel.mockImplementation(() => mockSavedProduct);

    // Act
    await createProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error,
      message: "Error in crearing product",
    });
  });
});

describe("deleteProductController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should delete product successfully", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };

    productModel.findByIdAndDelete = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(mockProduct1),
    });

    // Act
    await deleteProductController(req, res);

    // Assert
    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(
      "mock-product-id"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });
  });

  it("should handle errors during deletion", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    const error = new Error("Delete error");

    productModel.findByIdAndDelete = jest.fn().mockImplementation(() => {
      throw error;
    });

    // Act
    await deleteProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while deleting product",
      error,
    });
  });

  it("should handle deletion of non-existent product", async () => {
    // Arrange
    req.params = { pid: "non-existent-id" };

    productModel.findByIdAndDelete = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    // Act
    await deleteProductController(req, res);

    // Assert
    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(
      "non-existent-id"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });
  });
});

describe("updateProductController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      fields: {},
      files: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should update product successfully without photo", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    req.fields = {
      name: "Updated Product",
      description: "Updated Description",
      price: 150,
      category: mockCategory1._id,
      quantity: 20,
      shipping: true,
    };
    req.files = {};

    const mockUpdatedProduct = {
      ...req.fields,
      _id: "mock-product-id",
      slug: "Updated-Product",
      photo: { data: null, contentType: null },
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findByIdAndUpdate = jest
      .fn()
      .mockResolvedValue(mockUpdatedProduct);

    // Act
    await updateProductController(req, res);

    // Assert
    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "mock-product-id",
      expect.objectContaining({
        name: "Updated Product",
        slug: "Updated-Product",
      }),
      { new: true }
    );
    expect(mockUpdatedProduct.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Product Updated Successfully",
        products: mockUpdatedProduct,
      })
    );
  });

  it("should update product successfully with photo", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    req.fields = {
      name: "Updated Product",
      description: "Updated Description",
      price: 150,
      category: mockCategory1._id,
      quantity: 20,
      shipping: true,
    };
    req.files = {
      photo: {
        path: "/mock/path/to/updated-photo.jpg",
        type: "image/jpeg",
        size: 800000, // 800KB
      },
    };

    const mockPhotoData = Buffer.from("updated-photo-data");
    fs.readFileSync.mockReturnValue(mockPhotoData);

    const mockUpdatedProduct = {
      ...req.fields,
      _id: "mock-product-id",
      slug: "Updated-Product",
      photo: { data: null, contentType: null },
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findByIdAndUpdate = jest
      .fn()
      .mockResolvedValue(mockUpdatedProduct);

    // Act
    await updateProductController(req, res);

    // Assert
    expect(fs.readFileSync).toHaveBeenCalledWith(
      "/mock/path/to/updated-photo.jpg"
    );
    expect(mockUpdatedProduct.photo.data).toBe(mockPhotoData);
    expect(mockUpdatedProduct.photo.contentType).toBe("image/jpeg");
    expect(mockUpdatedProduct.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Product Updated Successfully",
      })
    );
  });

  it("should return 500 error when name is missing during update", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    req.fields = {
      description: "Updated Description",
      price: 150,
      category: mockCategory1._id,
      quantity: 20,
    };

    // Act
    await updateProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  it("should return 500 error when description is missing during update", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    req.fields = {
      name: "Updated Product",
      price: 150,
      category: mockCategory1._id,
      quantity: 20,
    };

    // Act
    await updateProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
  });

  it("should return 500 error when price is missing during update", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    req.fields = {
      name: "Updated Product",
      description: "Updated Description",
      category: mockCategory1._id,
      quantity: 20,
    };

    // Act
    await updateProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
  });

  it("should return 500 error when category is missing during update", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    req.fields = {
      name: "Updated Product",
      description: "Updated Description",
      price: 150,
      quantity: 20,
    };

    // Act
    await updateProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
  });

  it("should return 500 error when quantity is missing during update", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    req.fields = {
      name: "Updated Product",
      description: "Updated Description",
      price: 150,
      category: mockCategory1._id,
    };

    // Act
    await updateProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
  });

  it("should return 500 error when photo size exceeds 1MB during update", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    req.fields = {
      name: "Updated Product",
      description: "Updated Description",
      price: 150,
      category: mockCategory1._id,
      quantity: 20,
    };
    req.files = {
      photo: {
        path: "/mock/path/to/photo.jpg",
        type: "image/jpeg",
        size: 1500000, // 1.5MB - exceeds limit
      },
    };

    // Act
    await updateProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "photo is Required and should be less then 1mb",
    });
  });

  it("should handle errors during product update", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    req.fields = {
      name: "Updated Product",
      description: "Updated Description",
      price: 150,
      category: mockCategory1._id,
      quantity: 20,
    };
    req.files = {};

    const error = new Error("Update error");
    productModel.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

    // Act
    await updateProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error,
      message: "Error in Updte product",
    });
  });

  it("should handle errors during save after update", async () => {
    // Arrange
    req.params = { pid: "mock-product-id" };
    req.fields = {
      name: "Updated Product",
      description: "Updated Description",
      price: 150,
      category: mockCategory1._id,
      quantity: 20,
    };
    req.files = {};

    const error = new Error("Save error");
    const mockUpdatedProduct = {
      ...req.fields,
      slug: "Updated-Product",
      photo: { data: null, contentType: null },
      save: jest.fn().mockRejectedValue(error),
    };

    productModel.findByIdAndUpdate = jest
      .fn()
      .mockResolvedValue(mockUpdatedProduct);

    // Act
    await updateProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error,
      message: "Error in Updte product",
    });
  });
});
