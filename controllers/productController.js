import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

import dotenv from "dotenv";

dotenv.config();

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      // FIXED BUG: variable typo:
      // counTotal: products.length,
      countTotal: products.length,
      // FIXED BUG: Message typo:
      // message: "ALlProducts ",
      message: "All Products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      // FIXED BUG: Message typo:
      // message: "Erorr in getting products",
      message: "Error in getting products",
      error: error.message,
    });
  }
};
// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    // FIXED BUG: Add check for product existence:
    // will handle case where product is not found
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product Not Found",
        product: null,
      });
    }

    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      // FIXED BUG: Error message typo:
      // message: "Eror while getitng single product",
      message: "Error while getting single product",
      error,
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");

    // FIXED BUG: Add check for product existence:
    // will handle case where product is not found
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product Not Found",
      });
    }

    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    } else {
      // FIXED BUG: Consistent error handling for missing photo:
      // Original: res.status(404).send("Photo Not Found");
      return res.status(404).send({
        success: false,
        message: "Photo Not Found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      // FIXED BUG: Error message typo:
      // message: "Erorr while getting photo",
      message: "Error while getting photo",
      error,
    });
  }
};

// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (!Array.isArray(checked) || !Array.isArray(radio)) {
      return res.status(400).send({
        success: false,
        message: "Invalid filter inputs",
      });
    }
    if (checked.length > 0) {
      args.category = checked;
    }
    if (radio.length > 0) {
      if (
        radio.length == 2 &&
        radio[0] > 0 &&
        radio[1] > 0 &&
        radio[0] < radio[1]
      ) {
        args.price = { $gte: radio[0], $lte: radio[1] };
      } else {
        return res.status(400).send({
          success: false,
          message: "Invalid filter inputs",
        });
      }
    }

    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      // FIXED BUG: Missing message key:
      message: "Filtered Products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      // FIXED BUG: Error message typo:
      // message: "Error WHile Filtering Products",
      message: "Error while filtering products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      message: "Total Products Count",
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    if (req.params.page) {
      req.params.page = parseInt(req.params.page);
      if (isNaN(req.params.page)) {
        return res.status(400).send({
          success: false,
          message: "Invalid page number",
        });
      } else {
        if (req.params.page > 0) {
          req.params.page = req.params.page;
        } else {
          req.params.page = 1;
        }
      }
    }
    const page = req.params.page || 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      // FIXED BUG: Missing message key:
      message: "Product List Fetched",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

// search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    if (!keyword || keyword.trim() === "") {
      return res.status(400).send({
        success: false,
        message: "Keyword is required for search",
      });
    }
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    // FIXED BUG: Missing status code:
    // Original: res.json(resutls);
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    if (!pid || !cid) {
      return res.status(400).send({
        success: false,
        message: "Product ID and Category ID are required",
      });
    }
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      // FIXED BUG: Missing message key:
      message: "Related Products Fetched",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    if (!req.params.slug) {
      return res.status(400).send({
        success: false,
        message: "Category slug is required",
      });
    }
    const category = await categoryModel.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category Not Found",
      });
    }
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      // FIXED BUG: Missing message key:
      message: "Products By Category Fetched",
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};
