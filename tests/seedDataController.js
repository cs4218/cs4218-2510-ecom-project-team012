import { clearTestDB } from "./setupTestDB.js";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

// General structure generated with the help of AI

export const resetSeedDataController = async (req, res) => {
  try {
    await clearTestDB();
    res
      .status(200)
      .send({ success: true, message: "Test database cleared successfully" });
  } catch (error) {
    console.error("Error clearing test database:", error);
    res
      .status(500)
      .send({ success: false, message: "Error clearing test database", error });
  }
};

export const seedCategoryDataController = async (req, res) => {
  try {
    const categories = await categoryModel.insertMany(req.body);
    res.status(200).send({
      success: true,
      message: "Categories seeded successfully",
      categories,
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Error seeding categories", error });
  }
};

export const seedProductDataController = async (req, res) => {
  try {
    const products = await productModel.insertMany(req.body);
    res.status(200).send({
      success: true,
      message: "Products seeded successfully",
      products,
    });
  } catch (error) {
    console.error("Error seeding products:", error);
    res
      .status(500)
      .send({ success: false, message: "Error seeding products", error });
  }
};

export const seedUserDataController = async (req, res) => {
  try {
    const users = await userModel.insertMany(req.body);
    res
      .status(200)
      .send({ success: true, message: "Users seeded successfully", users });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Error seeding users", error });
  }
};

export const seedOrderDataController = async (req, res) => {
  try {
    const orders = await orderModel.insertMany(req.body);
    res
      .status(200)
      .send({ success: true, message: "Orders seeded successfully", orders });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Error seeding orders", error });
  }
};
