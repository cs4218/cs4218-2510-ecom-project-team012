import {
  getProductController,
  getSingleProductController,
  productPhotoController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
} from "./productController.js";
import productModel from "../models/productModel.js";
import e from "cors";

jest.mock("../models/productModel.js");

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
  category: mockCategory1._id,
  quantity: 10,
  createdAt: new Date(),
};

const mockProduct2 = {
  _id: "mock-product-2",
  name: "Product2",
  slug: "mock-product-2",
  description: "Description2",
  price: 200,
  category: mockCategory1._id,
  quantity: 20,
  photo: { data: Buffer.from("mock-image-data"), contentType: "image/png" },
  shipping: true,
  createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour earlier from now
};

// General structure generated with the help of AI
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
      json: jest.fn(),
      set: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return paginated product list", async () => {
    req.params = { page: "2" };
    const mockProducts = [{ name: "PaginatedProduct" }];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    await productListController(req, res);

    expect(productModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product List Fetched",
      products: mockProducts,
    });
  });

  it("should default to page 1 if page param is invalid", async () => {
    req.params = { page: "invalid" };
    const mockProducts = [{ name: "PaginatedProduct" }];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    await productListController(req, res);

    expect(productModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product List Fetched",
      products: mockProducts,
    });
  });

  it("should handle errors in paginated listing", async () => {
    req.params = { page: "2" };
    productModel.find.mockImplementation(() => {
      throw new Error("Error in paginated listing");
    });

    await productListController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "error in per page ctrl",
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
      set: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return search results", async () => {
    req.params = { keyword: "test" };
    const mockResults = [{ name: "SearchResult" }];
    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockResults),
    });

    await searchProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "test", $options: "i" } },
        { description: { $regex: "test", $options: "i" } },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResults);
  });

  it("should handle errors in searching products", async () => {
    req.params = { keyword: "test" };
    productModel.find.mockImplementation(() => {
      throw new Error("Error in searching products");
    });

    await searchProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    // Good practice will be to make the error message a constant and import it here
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Error In Search Product API",
      })
    );
  });

  it("should handle when no results found", async () => {
    req.params = { keyword: "non-existent-keyword" };
    const mockResults = [];
    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockResults),
    });

    await searchProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "non-existent-keyword", $options: "i" } },
        { description: { $regex: "non-existent-keyword", $options: "i" } },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResults);
  });

  it("should handle invalid keyword parameter", async () => {
    req.params = { keyword: "" }; // Empty keyword
    const mockResults = [];
    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockResults),
    });

    await searchProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "", $options: "i" } },
        { description: { $regex: "", $options: "i" } },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResults);
  });
});
