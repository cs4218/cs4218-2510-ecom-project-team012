import express from "express";
import request from "supertest";
import mongoose from "mongoose";

import connectDB from "../../config/db.js";
import { createTestDB, closeTestDB } from "../setupTestDB.js";
import productModel from "../../models/productModel.js";
import { productFiltersController } from "../../controllers/productController.js";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.post("/api/v1/product/product-filters", productFiltersController);
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

describe("NoSQL Injection - Category/Price Filters", () => {
  test("Rejects non-array payloads attempting operator injection", async () => {
    const malicious = {
      checked: { $gt: "" },
      radio: { $ne: [] },
    };

    const res = await request(app)
      .post("/api/v1/product/product-filters")
      .send(malicious)
      .expect(400);

    expect(res.body?.success).toBe(false);
    expect(res.body?.message).toMatch(/Invalid filter inputs/i);
  });

  test("Accepts proper arrays and returns filtered products without evaluating operators", async () => {
    const catA = new mongoose.Types.ObjectId();
    const catB = new mongoose.Types.ObjectId();

    await productModel.create([
      {
        name: "CatA One",
        slug: `cata-one-${Date.now()}-1`,
        description: "desc",
        price: 50,
        category: catA,
        quantity: 5,
        shipping: false,
      },
      {
        name: "CatB One",
        slug: `catb-one-${Date.now()}-2`,
        description: "desc",
        price: 50,
        category: catB,
        quantity: 5,
        shipping: false,
      },
    ]);

    const res = await request(app)
      .post("/api/v1/product/product-filters")
      .send({ checked: [catA], radio: [0, 100] })
      .expect(200);

    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.products)).toBe(true);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].name).toMatch(/CatA One/);
  });
});
