// from ./test/seedDataRoutes.js
// functions to help setup seed data for frontend integration tests only

import axios from "axios";

const resetDatabase = async () => {
  await axios.get("/api/v1/seed/reset");
};

const seedCategories = async (categories) => {
  await axios.post("/api/v1/seed/categories", categories);
};

const seedProducts = async (products) => {
  await axios.post("/api/v1/seed/products", products);
};

const seedOrders = async (orders) => {
  await axios.post("/api/v1/seed/orders", orders);
};

const seedUsers = async (users) => {
  await axios.post("/api/v1/seed/users", users);
};

export { resetDatabase, seedCategories, seedProducts, seedOrders, seedUsers };
