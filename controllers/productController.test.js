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

jest.mock("../models/productModel.js");

describe("Product Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
      set: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getProductController", () => {
    it("should return products with success", async () => {
      const mockProducts = [{ name: "Test" }];
      productModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProducts),
      });

      await getProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        countTotal: mockProducts.length,
        message: "All Products",
        products: mockProducts,
      });
    });

    it("should handle errors", async () => {
      productModel.find.mockImplementation(() => {
        throw new Error("Error in getting products");
      });

      await getProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
      // Good practice will be to make the error message a constant and import it here
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Error in getting products" })
      );
    });
  });

  describe("getSingleProductController", () => {
    it("should return a single product", async () => {
      req.params = { slug: "test-slug" };
      const mockProduct = { name: "Test" };
      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockProduct),
      });

      await getSingleProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Single Product Fetched",
        product: mockProduct,
      });
    });

    it("should handle errors", async () => {
      req.params = { slug: "test-slug" };
      productModel.findOne.mockImplementation(() => {
        throw new Error("Error while getting single product");
      });

      await getSingleProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
      // Good practice will be to make the error message a constant and import it here
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Error while getting single product",
        })
      );
    });

    it("should handle when product not found", async () => {
      req.params = { slug: "non-existent-slug" };
      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(null),
      });

      await getSingleProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Single Product Fetched",
        product: null,
      });
    });
  });

  describe("productPhotoController", () => {
    it("should return photo data if exists", async () => {
      req.params = { pid: "123" };
      const mockPhoto = { data: Buffer.from("abc"), contentType: "image/png" };
      productModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ photo: mockPhoto }),
      });

      await productPhotoController(req, res);

      expect(res.set).toHaveBeenCalledWith("Content-type", "image/png");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockPhoto.data);
    });

    it("should not return photo if data is missing", async () => {
      req.params = { pid: "123" };
      productModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ photo: { data: null } }),
      });

      await productPhotoController(req, res);

      expect(res.set).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      req.params = { pid: "123" };
      productModel.findById.mockImplementation(() => {
        throw new Error("Erorr while getting photo");
      });

      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
      // Good practice will be to make the error message a constant and import it here
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Erorr while getting photo" })
      );
    });

    it("should handle when pid is invalid", async () => {
      req.params = { pid: "invalid-id" };
      productModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
      // Good practice will be to make the error message a constant and import it here
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Erorr while getting photo" })
      );
    });
  });

  describe("productFiltersController", () => {
    it("should filter products based on category and price", async () => {
      req.body = {
        checked: ["cat1", "cat2"],
        radio: [10, 50],
      };
      const mockProducts = [{ name: "FilteredProduct" }];
      productModel.find.mockResolvedValue(mockProducts);

      await productFiltersController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({
        category: ["cat1", "cat2"],
        price: { $gte: 10, $lte: 50 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Filtered Products",
        products: mockProducts,
      });
    });

    it("should handle empty filters", async () => {
      req.body = {
        checked: [],
        radio: [],
      };
      const mockProducts = [{ name: "AllProducts" }];
      productModel.find.mockResolvedValue(mockProducts);

      await productFiltersController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Filtered Products",
        products: mockProducts,
      });
    });

    it("should handle errors in filtering", async () => {
      req.body = {
        checked: ["cat1", "cat2"],
        radio: [10, 50],
      };
      productModel.find.mockImplementation(() => {
        throw new Error("Error while filtering products");
      });

      await productFiltersController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
      // Good practice will be to make the error message a constant and import it here
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Error while filtering products",
        })
      );
    });
  });

  describe("productCountController", () => {
    it("should return total product count", async () => {
      productModel.find.mockReturnValue({
        estimatedDocumentCount: jest.fn().mockResolvedValue(42),
      });

      await productCountController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Total Products Count",
        total: 42,
      });
    });

    it("should handle errors in counting products", async () => {
      productModel.find.mockImplementation(() => {
        throw new Error("Error in product count");
      });

      await productCountController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
      // Good practice will be to make the error message a constant and import it here
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Error in product count" })
      );
    });
  });

  describe("productListController", () => {
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
});
