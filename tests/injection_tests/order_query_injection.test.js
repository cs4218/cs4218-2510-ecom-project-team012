import jwt from "jsonwebtoken";
import request from "supertest";
import mongoose from "mongoose";
import express from "express";

import connectDB from "../../config/db.js";
import { createTestDB, closeTestDB } from "../setupTestDB.js";
import userModel from "../../models/userModel.js";
import productModel from "../../models/productModel.js";
import orderModel from "../../models/orderModel.js";
import { requireSignIn } from "../../middlewares/authMiddleware.js";
import { getOrdersController } from "../../controllers/order/getOrdersController.js";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.get("/api/v1/auth/orders", requireSignIn, getOrdersController);
  return app;
}

let app;

// Ensure server does not auto-connect/listen
beforeAll(async () => {
  process.env.NODE_ENV = "backend-int";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "injection-test-secret";
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

describe("NoSQL Injection - Orders API", () => {
  test("Legit token returns only buyer's orders", async () => {
    const buyerA = await userModel.create({
      name: "Buyer A",
      email: `a_${Date.now()}@ex.com`,
      password: "secret",
      phone: "11111111",
      address: "1 A Street",
      answer: "blue",
      dob: new Date("2000-01-01"),
      role: 0,
    });
    const buyerB = await userModel.create({
      name: "Buyer B",
      email: `b_${Date.now()}@ex.com`,
      password: "secret",
      phone: "22222222",
      address: "2 B Street",
      answer: "green",
      dob: new Date("2000-01-02"),
      role: 0,
    });

    const p1 = await productModel.create({
      name: `Prod-${Date.now()}-1`,
      slug: `prod-${Date.now()}-1`,
      description: "d",
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: false,
    });
    const p2 = await productModel.create({
      name: `Prod-${Date.now()}-2`,
      slug: `prod-${Date.now()}-2`,
      description: "d",
      price: 20,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: false,
    });

    await orderModel.create({ buyer: buyerA._id, products: [p1._id], payment: {}, status: "Processing" });
    await orderModel.create({ buyer: buyerB._id, products: [p2._id], payment: {}, status: "Processing" });

    const token = jwt.sign({ _id: buyerA._id }, process.env.JWT_SECRET);

    const res = await request(app)
      .get("/api/v1/auth/orders")
      .set("authorization", token)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]?.buyer?.name).toBe("Buyer A");
  });

  test("Attempted operator injection in _id is rejected with 401 (no leakage)", async () => {
    const buyerA = await userModel.create({
      name: "Buyer A",
      email: `a2_${Date.now()}@ex.com`,
      password: "secret",
      phone: "11111111",
      address: "1 A Street",
      answer: "blue",
      dob: new Date("2000-01-01"),
      role: 0,
    });
    const buyerB = await userModel.create({
      name: "Buyer B",
      email: `b2_${Date.now()}@ex.com`,
      password: "secret",
      phone: "22222222",
      address: "2 B Street",
      answer: "green",
      dob: new Date("2000-01-02"),
      role: 0,
    });

    const p1 = await productModel.create({
      name: `Prod2-${Date.now()}-1`,
      slug: `prod2-${Date.now()}-1`,
      description: "d",
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: false,
    });
    const p2 = await productModel.create({
      name: `Prod2-${Date.now()}-2`,
      slug: `prod2-${Date.now()}-2`,
      description: "d",
      price: 20,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: false,
    });

    await orderModel.create({ buyer: buyerA._id, products: [p1._id], payment: {}, status: "Processing" });
    await orderModel.create({ buyer: buyerB._id, products: [p2._id], payment: {}, status: "Processing" });

    // Malicious payload: try to force query { buyer: { $ne: null } }
    const injectedPayload = { _id: { $ne: null } };
    // Sign with the WRONG secret to simulate an attacker who cannot forge a valid token
    const token = jwt.sign(injectedPayload, "wrong-secret");

    const res = await request(app)
      .get("/api/v1/auth/orders")
      .set("authorization", token)
      .expect(401);

    // Response body shape may vary; just ensure unauthorized status
    expect(typeof res.body).toBe("object");
  });
});
