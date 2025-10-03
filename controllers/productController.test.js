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
} from "./productController.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

// General structure generated with the help of AI
jest.mock("../models/productModel.js");
jest.mock("../models/categoryModel.js");

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

  it("should return related products with success", async () => {
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
