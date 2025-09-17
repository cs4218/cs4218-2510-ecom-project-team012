import {
  getProductController,
  getSingleProductController,
  productPhotoController,
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
        counTotal: mockProducts.length,
        message: "ALlProducts ",
        products: mockProducts,
      });
    });

    it("should handle errors", async () => {
      productModel.find.mockImplementation(() => {
        throw new Error("Erorr in getting products");
      });

      await getProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
      // Good practice will be to make the error message a constant and import it here
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Erorr in getting products" })
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
  });
});
