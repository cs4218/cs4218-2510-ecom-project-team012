import productModel from "../models/productModel";
import categoryModel from "../models/categoryModel";
import userModel from "../models/userModel";
import orderModel from "../models/orderModel";
import USERS from "./seed_data/users.js";
import CATEGORIES from "./seed_data/categories.js";
import PRODUCTS from "./seed_data/products.js";
import ORDERS from "./seed_data/orders.js";

// Seed test data into in-memory MongoDB
// General structure generated with the help of AI

export const seedTestData = async () => {
  try {
    await categoryModel.deleteMany({});
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await orderModel.deleteMany({});

    await categoryModel.insertMany(CATEGORIES);
    await userModel.insertMany(USERS);
    await productModel.insertMany(PRODUCTS);
    await orderModel.insertMany(ORDERS);

    console.log("Seeded test data successfully");
  } catch (error) {
    console.error("Error seeding test data:", error);
  }
};

export const clearSeedData = async () => {
  try {
    await categoryModel.deleteMany({});
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await orderModel.deleteMany({});

    console.log("Cleared seed data successfully");
  } catch (error) {
    console.error("Error clearing seed data:", error);
  }
};
