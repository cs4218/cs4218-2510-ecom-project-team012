// from ./test/seedDataRoutes.js
// functions to help setup seed data for frontend integration tests only

import axios from "axios";

const resetSeedDatabase = async () => {
  await axios.get("/api/v1/seed/reset");
};

const seedCategoryData = async (categories) => {
  await axios.post("/api/v1/seed/category-data", categories);
};

const seedProductData = async (products) => {
  await axios.post("/api/v1/seed/product-data", products);
};

const seedOrderData = async (orders) => {
  await axios.post("/api/v1/seed/order-data", orders);
};

const seedUserData = async (users) => {
  await axios.post("/api/v1/seed/user-data", users);
};

export { resetSeedDatabase, seedCategoryData, seedProductData, seedOrderData, seedUserData };
