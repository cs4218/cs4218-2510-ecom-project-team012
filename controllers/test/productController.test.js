import productModel from "../../models/productModel.js";
import categoryModel from "../../models/categoryModel.js";
import fs from "fs";
import slugify from "slugify";
import {
  createProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,
} from "../productController.js";

// Mock modules
jest.mock("../../models/productModel.js");
jest.mock("../../models/categoryModel.js");
jest.mock("fs");
jest.mock("slugify");

describe("Product Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      fields: {},
      files: {},
      params: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      set: jest.fn(),
      json: jest.fn(),
    };

    // Setup slugify mock behavior
    slugify.mockImplementation((text) => text.toLowerCase().replace(/\s+/g, "-"));
  });

  test("should create a product successfully", async () => {
    mockReq.fields = {
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: "cat123",
      quantity: 10,
      shipping: true,
    };
    mockReq.files = {
      photo: {
        path: "/tmp/photo.jpg",
        type: "image/jpeg",
        size: 500000,
      },
    };

    const mockProduct = {
      photo: { data: null, contentType: null },
      save: jest.fn().mockResolvedValue({
        _id: "product123",
        name: "Test Product",
      }),
    };

    productModel.mockImplementation(() => mockProduct);
    fs.readFileSync.mockReturnValue(Buffer.from("fake-image-data"));

    await createProductController(mockReq, mockRes);

    expect(slugify).toHaveBeenCalledWith("Test Product");
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Product Created Successfully",
      })
    );
  });

  test("should return error when name is missing", async () => {
    mockReq.fields = {
      description: "Test Description",
      price: 100,
    };

    await createProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  test("should get all products", async () => {
    const mockProducts = [
      { _id: "1", name: "Product 1", price: 100 },
      { _id: "2", name: "Product 2", price: 200 },
    ];

    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    };

    productModel.find.mockReturnValue(mockQuery);

    await getProductController(mockReq, mockRes);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        products: mockProducts,
      })
    );
  });

  test("should handle errors when getting products", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    productModel.find.mockImplementation(() => {
      throw new Error("Database error");
    });

    await getProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    consoleLogSpy.mockRestore();
  });

  test("should get single product by slug", async () => {
    const mockProduct = { _id: "1", name: "Product 1", slug: "product-1" };
    mockReq.params.slug = "product-1";

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProduct),
    };

    productModel.findOne.mockReturnValue(mockQuery);

    await getSingleProductController(mockReq, mockRes);

    expect(productModel.findOne).toHaveBeenCalledWith({ slug: "product-1" });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return product photo", async () => {
    const mockPhotoData = Buffer.from("fake-image-data");
    const mockProduct = {
      photo: { data: mockPhotoData, contentType: "image/jpeg" },
    };

    mockReq.params.pid = "product123";

    const mockQuery = {
      select: jest.fn().mockResolvedValue(mockProduct),
    };

    productModel.findById.mockReturnValue(mockQuery);

    await productPhotoController(mockReq, mockRes);

    expect(mockRes.set).toHaveBeenCalledWith("Content-type", "image/jpeg");
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should delete product successfully", async () => {
    mockReq.params.pid = "product123";

    const mockQuery = {
      select: jest.fn().mockResolvedValue({ _id: "product123" }),
    };

    productModel.findByIdAndDelete.mockReturnValue(mockQuery);

    await deleteProductController(mockReq, mockRes);

    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("product123");
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should update product successfully", async () => {
    mockReq.params.pid = "product123";
    mockReq.fields = {
      name: "Updated Product",
      description: "Updated Description",
      price: 150,
      category: "cat123",
      quantity: 20,
    };

    const mockUpdatedProduct = {
      _id: "product123",
      photo: { data: null, contentType: null },
      save: jest.fn().mockResolvedValue({}),
    };

    productModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedProduct);

    await updateProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  test("should filter products by category and price", async () => {
    mockReq.body = {
      checked: ["cat1", "cat2"],
      radio: [100, 500],
    };

    const mockProducts = [{ _id: "1", name: "Filtered Product" }];
    productModel.find.mockResolvedValue(mockProducts);

    await productFiltersController(mockReq, mockRes);

    expect(productModel.find).toHaveBeenCalledWith({
      category: ["cat1", "cat2"],
      price: { $gte: 100, $lte: 500 },
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return product count", async () => {
    const mockQuery = {
      estimatedDocumentCount: jest.fn().mockResolvedValue(42),
    };

    productModel.find.mockReturnValue(mockQuery);

    await productCountController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      total: 42,
    });
  });

  test("should return paginated products", async () => {
    mockReq.params.page = "2";

    const mockProducts = [{ _id: "1", name: "Product 1" }];

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    };

    productModel.find.mockReturnValue(mockQuery);

    await productListController(mockReq, mockRes);

    expect(mockQuery.skip).toHaveBeenCalledWith(6);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should search products by keyword", async () => {
    mockReq.params.keyword = "laptop";

    const mockResults = [
      { _id: "1", name: "Gaming Laptop" },
      { _id: "2", name: "Business Laptop" },
    ];

    const mockQuery = {
      select: jest.fn().mockResolvedValue(mockResults),
    };

    productModel.find.mockReturnValue(mockQuery);

    await searchProductController(mockReq, mockRes);

    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "laptop", $options: "i" } },
        { description: { $regex: "laptop", $options: "i" } },
      ],
    });
    expect(mockRes.json).toHaveBeenCalledWith(mockResults);
  });

  test("should get related products", async () => {
    mockReq.params = {
      pid: "product123",
      cid: "cat123",
    };

    const mockProducts = [{ _id: "2", name: "Related Product 1" }];

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProducts),
    };

    productModel.find.mockReturnValue(mockQuery);

    await realtedProductController(mockReq, mockRes);

    expect(productModel.find).toHaveBeenCalledWith({
      category: "cat123",
      _id: { $ne: "product123" },
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should get products by category", async () => {
    mockReq.params.slug = "electronics";

    const mockCategory = { _id: "cat123", name: "Electronics" };
    const mockProducts = [{ _id: "1", name: "Product 1" }];

    categoryModel.findOne.mockResolvedValue(mockCategory);

    const mockQuery = {
      populate: jest.fn().mockResolvedValue(mockProducts),
    };

    productModel.find.mockReturnValue(mockQuery);

    await productCategoryController(mockReq, mockRes);

    expect(categoryModel.findOne).toHaveBeenCalledWith({
      slug: "electronics",
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
