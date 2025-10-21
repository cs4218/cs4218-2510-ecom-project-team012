// from ./test/seedDataRoutes.js
// functions to help setup seed data for frontend integration tests only

import axios from "axios";

const resetSeedDatabase = async () => {
  await axios.get("/api/v1/seed/reset");
};

const seedCategoryData = async (categories) => {
  const { data: categoryRes } = await axios.post(
    "/api/v1/seed/category-data",
    categories
  );
  return categoryRes;
};

const seedProductData = async (products) => {
  const { data: productRes } = await axios.post(
    "/api/v1/seed/product-data",
    products
  );

  return productRes;
};

const seedOrderData = async (orders) => {
  const { data: orderRes } = await axios.post(
    "/api/v1/seed/order-data",
    orders
  );
  return orderRes;
};

const seedUserData = async (users) => {
  const { data: userRes } = await axios.post("/api/v1/seed/user-data", users);
  return userRes;
};

export {
  resetSeedDatabase,
  seedCategoryData,
  seedProductData,
  seedOrderData,
  seedUserData,
};
