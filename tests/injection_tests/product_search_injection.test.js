import express from "express";
import request from "supertest";
import mongoose from "mongoose";

import connectDB from "../../config/db.js";
import { createTestDB, closeTestDB } from "../setupTestDB.js";
import productModel from "../../models/productModel.js";
import { searchProductController } from "../../controllers/productController.js";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.get("/api/v1/product/search/:keyword", searchProductController);
  return app;
}

let app;

beforeAll(async () => {
  const uri = await createTestDB();
  process.env.MONGO_URL = uri;
  await connectDB();
  app = makeApp();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe("NoSQL Injection - Product Search", () => {
  test("Injection-like keyword does not broaden results (should return 0 for no matches)", async () => {
    await productModel.create({
      name: "Safe Gadget",
      slug: `safe-gadget-${Date.now()}`,
      description: "A nice gadget",
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 5,
      shipping: false,
    });

    // Use a keyword that, if interpreted as an operator, could overmatch
    // Here it should be treated as a literal string in regex
    const malicious = encodeURIComponent('{"$ne":""}');

    const res = await request(app)
      .get(`/api/v1/product/search/${malicious}`)
      .expect(200);

    // Should not match anything because literal {"$ne":""} does not exist in name/description
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("Regular keyword still works as expected", async () => {
    await productModel.create({
      name: "Widget Alpha",
      slug: `widget-alpha-${Date.now()}`,
      description: "Alpha version widget",
      price: 20,
      category: new mongoose.Types.ObjectId(),
      quantity: 3,
      shipping: true,
    });

    const res = await request(app)
      .get(`/api/v1/product/search/${encodeURIComponent("alpha")}`)
      .expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toMatch(/Widget Alpha/);
  });
});
