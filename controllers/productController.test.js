import {
  getProductController,
  getSingleProductController,
  productPhotoController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,
  createProductController,
  deleteProductController,
  updateProductController,
} from "./productController.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import fs from "fs";

// ---------------------------------------------

// Megan's Tests for
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

describe("getProductController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("should get all products with success", async () => {
    const mockProducts = [mockProduct1, mockProduct2];
    // Arrange
    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    // Act
    await getProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        countTotal: mockProducts.length,
        message: expect.stringMatching(/all products/i),
        products: mockProducts,
      })
    );
  });

  it("should handle errors and return 500 status code", async () => {
    // Arrange
    const error = new Error("Error in getting products");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await getProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
      })
    );
  });

  it("should return empty array when no products found", async () => {
    // Arrange
    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    // Act
    await getProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        countTotal: 0,
        message: expect.stringMatching(/all products/i),
        products: [],
      })
    );
  });

  it("should only return 12 products if more than 12 exist", async () => {
    // Arrange
    const mockProducts = Array.from({ length: 15 }, (_, i) => ({
      ...mockProduct1,
      _id: `mock-product-${i + 1}`,
      name: `Product${i + 1}`,
    }));
    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnValue({
        // mock .limit(12) to limit results to first 12 products
        sort: jest.fn().mockResolvedValue(mockProducts.slice(0, 12)),
      }),
    });

    // Act
    await getProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        countTotal: 12,
        message: expect.stringMatching(/all products/i),
        products: mockProducts.slice(0, 12),
      })
    );
  });
});

describe("getSingleProductController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return a single product with success", async () => {
    // Arrange
    req.params = { slug: "test-slug" };
    productModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProduct1),
    });

    // Act
    await getSingleProductController(req, res);

    // Assert
    expect(productModel.findOne).toHaveBeenCalledWith(req.params);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/product fetched/i),
        product: mockProduct1,
      })
    );
  });

  it("should handle errors and return 500 status code", async () => {
    // Arrange
    req.params = { slug: "test-slug" };
    const error = new Error("Error while getting single product");
    productModel.findOne.mockImplementation(() => {
      throw error;
    });

    // Act
    await getSingleProductController(req, res);

    // Assert
    expect(productModel.findOne).toHaveBeenCalledWith(req.params);
    expect(res.status).toHaveBeenCalledWith(500);
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
        error,
      })
    );
  });

  it("should handle when product not found and return 404 status code", async () => {
    // Arrange
    req.params = { slug: "non-existent-slug" };
    productModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(null),
    });

    // Act
    await getSingleProductController(req, res);

    // Assert
    expect(productModel.findOne).toHaveBeenCalledWith(req.params);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/not found/i),
        product: null,
      })
    );
  });
});

describe("productPhotoController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      set: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return photo data if exist with success", async () => {
    // Arrange
    req.params = { pid: mockProduct2._id };
    const mockPhoto = mockProduct2.photo;
    productModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ photo: mockPhoto }),
    });

    // Act
    await productPhotoController(req, res);

    // Assert
    expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);
    expect(res.set).toHaveBeenCalledWith("Content-type", mockPhoto.contentType);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockPhoto.data);
  });

  it("should not return photo if data is missing and return 404 status code", async () => {
    // Arrange
    req.params = { pid: mockProduct1._id };
    // Product1 has no photo data
    productModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ photo: { data: null } }),
    });

    // Act
    await productPhotoController(req, res);

    // Assert
    expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);
    expect(res.set).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/not found/i),
      })
    );
  });

  it("should handle errors and return 500 status code", async () => {
    // Arrange
    req.params = { pid: "123" };
    const error = new Error("Error while getting photo");
    productModel.findById.mockImplementation(() => {
      throw error;
    });

    // Act
    await productPhotoController(req, res);

    // Assert
    expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);
    expect(res.status).toHaveBeenCalledWith(500);
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
        error,
      })
    );
  });

  it("should handle when pid is invalid and return 404 status code", async () => {
    // Arrange
    req.params = { pid: "invalid-pid" };
    productModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    // Act
    await productPhotoController(req, res);

    // Assert
    expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);
    expect(res.status).toHaveBeenCalledWith(404);
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/not found/i),
      })
    );
  });
});

describe("productFiltersController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should filter products based on category and price with success", async () => {
    req.body = {
      checked: [mockCategory1._id],
      radio: [100, 500],
    };
    const mockFilteredProducts = [mockProduct1];
    productModel.find.mockResolvedValue(mockFilteredProducts);

    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        category: [mockCategory1._id],
        price: { $gte: 100, $lte: 500 },
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/filtered products/i),
        products: mockFilteredProducts,
      })
    );
  });

  it("should handle empty filters and return all products", async () => {
    // Arrange
    req.body = {
      checked: [],
      radio: [],
    };
    const mockProducts = [mockProduct1, mockProduct2];
    productModel.find.mockResolvedValue(mockProducts);

    // Act
    await productFiltersController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/filtered products/i),
        products: mockProducts,
      })
    );
  });

  it("should filter products based on price range only", async () => {
    // Arrange
    req.body = {
      checked: [],
      radio: [150, 250],
    };
    const mockFilteredProducts = [mockProduct2];
    productModel.find.mockResolvedValue(mockFilteredProducts);

    // Act
    await productFiltersController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        price: { $gte: 150, $lte: 250 },
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/filtered products/i),
        products: mockFilteredProducts,
      })
    );
  });

  it("should filter products based on category only", async () => {
    // Arrange
    req.body = {
      checked: [mockCategory1._id],
      radio: [],
    };
    const mockFilteredProducts = [mockProduct1, mockProduct2];
    productModel.find.mockResolvedValue(mockFilteredProducts);

    // Act
    await productFiltersController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        category: [mockCategory1._id],
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/filtered products/i),
        products: mockFilteredProducts,
      })
    );
  });

  it("should handle invalid filter inputs: invalid price range", async () => {
    // Arrange
    req.body = {
      checked: [],
      radio: [100, 10], // Invalid range
    };
    const error = new Error("Invalid filter inputs");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await productFiltersController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
      })
    );
  });

  it("should handle invalid filter inputs: more than 2 inputs in radio", async () => {
    // Arrange
    req.body = {
      checked: [],
      radio: [100, 200, 300], // Invalid length
    };
    const error = new Error("Invalid filter inputs");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await productFiltersController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
      })
    );
  });

  it("should handle invalid filter inputs: non-numeric price values", async () => {
    // Arrange
    req.body = {
      checked: [],
      radio: ["a", "b"], // Non-numeric values
    };
    const error = new Error("Invalid filter inputs");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await productFiltersController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
      })
    );
  });

  it("should handle invalid filter inputs: negative price values", async () => {
    // Arrange
    req.body = {
      checked: [],
      radio: [-100, 200], // Negative price
    };
    const error = new Error("Invalid filter inputs");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await productFiltersController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
      })
    );
  });

  it("should handle invalid filter inputs: non-array types", async () => {
    // Arrange
    req.body = {
      checked: "not-an-array", // Invalid type
      radio: [],
    };
    const error = new Error("Invalid filter inputs");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await productFiltersController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
      })
    );
  });

  it("should handle errors in filtering and return 400 status code", async () => {
    // Arrange
    req.body = {
      checked: [mockCategory1._id],
      radio: [100, 500],
    };
    const error = new Error("Error while filtering products");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await productFiltersController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
        error,
      })
    );
  });

  it("should handle no products found after filtering", async () => {
    // Arrange
    req.body = {
      checked: [mockCategory1._id],
      radio: [1000, 2000], // Price range that matches no products
    };
    productModel.find.mockResolvedValue([]);

    // Act
    await productFiltersController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        category: [mockCategory1._id],
        price: { $gte: 1000, $lte: 2000 },
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/filtered products/i),
        products: [],
      })
    );
  });
});

describe("productCountController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return total product count with success", async () => {
    // Arrange
    const mockTotalCount = 42;
    productModel.find.mockReturnValue({
      estimatedDocumentCount: jest.fn().mockResolvedValue(mockTotalCount),
    });

    // Act
    await productCountController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/total products/i),
        total: mockTotalCount,
      })
    );
  });

  it("should handle errors in counting products and return 400 status code", async () => {
    // Arrange
    const error = new Error("Error in product count");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await productCountController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
        error,
      })
    );
  });
});

describe("productListController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return paginated product list (Page > 1)", async () => {
    // Arrange
    req.params = { page: "2" };
    const mockProducts = [mockProduct1, mockProduct2];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    // Act
    await productListController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalled();
    expect(productModel.find().skip).toHaveBeenCalledWith(6); // (page-1)*perPage = (2-1)*6 = 6
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: expect.stringMatching(/product list fetched/i),
      products: mockProducts,
    });
  });

  it("should default to page 1 when no page is given (Page == 1)", async () => {
    // Arrange
    req.params = {};
    const mockProducts = [mockProduct1, mockProduct2];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    // Act
    await productListController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalled();
    expect(productModel.find().skip).toHaveBeenCalledWith(0); // (page-1)*perPage = (1-1)*6 = 0
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: expect.stringMatching(/product list fetched/i),
      products: mockProducts,
    });
  });

  it("should default to page 1 if page param is invalid (Page < 1)", async () => {
    // Arrange
    req.params = { page: "-3" };
    const mockProducts = [mockProduct1, mockProduct2];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    // Act
    await productListController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalled();
    expect(productModel.find().skip).toHaveBeenCalledWith(0); // (page-1)*perPage = (1-1)*6 = 0
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: expect.stringMatching(/product list fetched/i),
      products: mockProducts,
    });
  });

  it("should handle errors for invalid page number and return 400 status code", async () => {
    // Arrange
    req.params = { page: "invalid-page" };
    const mockProducts = [mockProduct1, mockProduct2];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    // Act
    await productListController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/invalid page number/i),
      })
    );
  });

  it("should handle errors in paginated listing and return 400 status code", async () => {
    // Arrange
    req.params = { page: "2" };
    const error = new Error("error in per page ctrl");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await productListController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
        error,
      })
    );
  });
});

describe("searchProductController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return search results with success", async () => {
    // Arrange
    req.params = { keyword: "test" };
    const mockResults = [mockProduct1, mockProduct2];
    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockResults),
    });

    // Act
    await searchProductController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "test", $options: "i" } },
        { description: { $regex: "test", $options: "i" } },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResults);
  });

  it("should return empty array if no matches found", async () => {
    // Arrange
    req.params = { keyword: "non-existent-keyword" };
    const mockResults = [];
    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockResults),
    });

    // Act
    await searchProductController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "non-existent-keyword", $options: "i" } },
        { description: { $regex: "non-existent-keyword", $options: "i" } },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResults);
  });

  it("should handle error if keyword is empty and return 400 status code", async () => {
    // Arrange
    req.params = { keyword: null };
    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });

    // Act
    await searchProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/keyword is required/i),
      })
    );
  });

  it("should handle errors in searching products and return 400 status code", async () => {
    // Arrange
    req.params = { keyword: "test" };
    const error = new Error("Error In Search Product API");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await searchProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
        error,
      })
    );
  });
});

describe("realtedProductController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return related products with success (less than 3 products)", async () => {
    // Arrange
    req.params = { pid: mockProduct1._id, cid: mockCategory1._id };
    const mockRelatedProducts = [mockProduct2];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockRelatedProducts),
    });

    // Act
    await realtedProductController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalledWith({
      category: mockCategory1._id,
      _id: { $ne: mockProduct1._id },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/related products/i),
        products: mockRelatedProducts,
      })
    );
  });

  it("should return 3 results when there are more than 3 matches", async () => {
    // Arrange
    req.params = { pid: mockProduct1._id, cid: mockCategory1._id };
    const mockRelatedProducts = [
      { ...mockProduct2, _id: "related-1" },
      { ...mockProduct2, _id: "related-2" },
      { ...mockProduct2, _id: "related-3" },
      { ...mockProduct2, _id: "related-4" },
    ];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockRelatedProducts.slice(0, 3)),
    });

    // Act
    await realtedProductController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalledWith({
      category: mockCategory1._id,
      _id: { $ne: mockProduct1._id },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/fetched/i),
        products: mockRelatedProducts.slice(0, 3),
      })
    );
  });

  it("should return 3 results when there are exactly 3 matches", async () => {
    // Arrange
    req.params = { pid: mockProduct1._id, cid: mockCategory1._id };
    const mockRelatedProducts = [
      { ...mockProduct2, _id: "related-1" },
      { ...mockProduct2, _id: "related-2" },
      { ...mockProduct2, _id: "related-3" },
    ];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockRelatedProducts),
    });

    // Act
    await realtedProductController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalledWith({
      category: mockCategory1._id,
      _id: { $ne: mockProduct1._id },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/related products/i),
        products: mockRelatedProducts,
      })
    );
  });

  it("should handle no related products found", async () => {
    // Arrange
    req.params = { pid: mockProduct1._id, cid: mockCategory1._id };
    const mockRelatedProducts = [];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockRelatedProducts),
    });

    // Act
    await realtedProductController(req, res);

    // Assert
    expect(productModel.find).toHaveBeenCalledWith({
      category: mockCategory1._id,
      _id: { $ne: mockProduct1._id },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/related products/i),
        products: mockRelatedProducts,
      })
    );
  });

  it("should handle missing pid and return 400 status code", async () => {
    // Arrange
    req.params = { cid: mockCategory1._id }; // Missing pid

    // Act
    await realtedProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/required/i),
      })
    );
  });

  it("should handle missing cid and return 400 status code", async () => {
    // Arrange
    req.params = { pid: mockProduct1._id }; // Missing cid

    // Act
    await realtedProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/required/i),
      })
    );
  });

  it("should handle errors in fetching related products and return 400 status code", async () => {
    // Arrange
    req.params = { pid: mockProduct1._id, cid: mockCategory1._id };
    const error = new Error("error while geting related product");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await realtedProductController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
        error,
      })
    );
  });
});

describe("productCategoryController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return products of a category with success", async () => {
    // Arrange
    req.params = { slug: mockCategory1.slug };
    const mockProducts = [mockProduct1, mockProduct2];
    categoryModel.findOne.mockResolvedValue(mockCategory1);
    productModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockProducts),
    });

    // Act
    await productCategoryController(req, res);

    // Assert
    expect(categoryModel.findOne).toHaveBeenCalledWith({
      slug: mockCategory1.slug,
    });
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/fetched/i),
        category: mockCategory1,
        products: mockProducts,
      })
    );
  });

  it("should handle category not found and return 404 status code", async () => {
    // Arrange
    req.params = { slug: "non-existent-slug" };
    categoryModel.findOne.mockResolvedValue(null);

    // Act
    await productCategoryController(req, res);

    // Assert
    expect(categoryModel.findOne).toHaveBeenCalledWith({
      slug: "non-existent-slug",
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/category not found/i),
      })
    );
  });

  it("should handle no products found in category", async () => {
    // Arrange
    req.params = { slug: mockCategory1.slug };
    categoryModel.findOne.mockResolvedValue(mockCategory1);
    productModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });

    // Act
    await productCategoryController(req, res);

    // Assert
    expect(categoryModel.findOne).toHaveBeenCalledWith({
      slug: mockCategory1.slug,
    });
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/fetched/i),
        category: mockCategory1,
        products: [],
      })
    );
  });

  it("should handle missing slug and return 400 status code", async () => {
    // Arrange
    req.params = {}; // Missing slug

    // Act
    await productCategoryController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/slug is required/i),
      })
    );
  });

  it("should handle errors in fetching category and return 400 status code", async () => {
    // Arrange
    req.params = { slug: mockCategory1.slug };
    const error = new Error("Error While Getting products");
    categoryModel.findOne.mockImplementation(() => {
      throw error;
    });

    // Act
    await productCategoryController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
        error,
      })
    );
  });

  it("should handle errors in fetching category products and return 400 status code", async () => {
    // Arrange
    req.params = { slug: mockCategory1.slug };
    const error = new Error("Error While Getting products");
    categoryModel.findOne.mockResolvedValue(mockCategory1);
    productModel.find.mockImplementation(() => {
      throw error;
    });

    // Act
    await productCategoryController(req, res);

    // Assert
    expect(categoryModel.findOne).toHaveBeenCalledWith({
      slug: mockCategory1.slug,
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: error.message,
        error,
      })
    );
  });
});

// ---------------------------------------------

// Pughal's Tests for
// 1. createProductController
// 2. deleteProductController
// 3. updateProductController
// General structure generated with the help of AI

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
