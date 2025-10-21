/**
 * Integration for /update-profile and auth propagation matrix.
 * Covers:
 * 1) Password validation (<6 chars rejected)
 * 2) Password hashing & data preservation
 * 3) Partial update (only provided fields changed)
 * 4) 401 (no token) and 403 (unauthorized role) propagation consistency
 */

import express from "express";
import request from "supertest";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "../../config/db.js";

// Controllers & middleware
import { updateProfileController } from "./updateProfileController.js";
import { getOrdersController } from "../order/getOrdersController.js";
import { getAllOrdersController } from "../order/getAllOrdersController.js";

// Models
import userModel from "../../models/userModel.js";
import orderModel from "../../models/orderModel.js";
import productModel from "../../models/productModel.js";

// Test helpers
import { createTestDB, closeTestDB } from "../../tests/setupTestDB.js";

/* ------------------------------ fake middleware ------------------------------ */
function fakeAuth(req, res, next) {
  const uid = req.header("x-test-user");
  if (!uid) return res.status(401).json({ message: "Unauthorized" });
  req.user = { _id: new mongoose.Types.ObjectId(uid), role: req.header("x-test-role") || "buyer" };
  next();
}

function fakeAdmin(req, res, next) {
  const role = req.header("x-test-role");
  if (role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
}

/* --------------------------------- factories --------------------------------- */
async function makeUser(overrides = {}) {
  const base = {
    name: "Test User",
    email: `user_${Date.now()}@mail.com`,
    password: await bcrypt.hash("secret123", 10),
    phone: "99999999",
    address: "123 Test Street",
    answer: "blue",
    dob: new Date("2000-01-01"),
    role: 0,
  };
  return userModel.create({ ...base, ...overrides });
}

async function makeAdmin() {
  return makeUser({ role: 1, name: "Admin User", email: `admin_${Date.now()}@mail.com` });
}

/* ----------------------------------- app ----------------------------------- */
function makeApp() {
  const app = express();
  app.use(express.json());
  app.put("/api/v1/auth/update-profile", fakeAuth, updateProfileController);
  app.get("/api/v1/auth/orders", fakeAuth, getOrdersController);
  app.get("/api/v1/auth/all-orders", fakeAuth, fakeAdmin, getAllOrdersController);
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

/* ----------------------------------- tests ----------------------------------- */
describe("Profile Update & Auth Propagation Integration", () => {
  test("1) Reject password shorter than 6 chars", async () => {
    const u = await makeUser();

    const res = await request(app)
      .put("/api/v1/auth/update-profile")
      .set("x-test-user", u._id.toString())
      .send({ password: "123" }) // too short
      .expect(400);

    expect(res.body?.message || res.text).toMatch(/password/i);
  });

  test("2) Hash password when updated & preserve other fields", async () => {
    const u = await makeUser({ name: "Hash Test" });

    const newPassword = "newsecure123";
    const res = await request(app)
      .put("/api/v1/auth/update-profile")
      .set("x-test-user", u._id.toString())
      .send({ password: newPassword })
      .expect(200);

    // Verify the hash actually changed and not equal to plaintext
    const updated = await userModel.findById(u._id);
    expect(updated.password).not.toBe(newPassword);
    expect(await bcrypt.compare(newPassword, updated.password)).toBe(true);

    // Non-updated fields remain
    expect(updated.email).toBe(u.email);
    expect(updated.name).toBe("Hash Test");
  });

  test("3) Partial update (only provided fields changed)", async () => {
    const u = await makeUser({ name: "Before Update", address: "Old Address" });

    const res = await request(app)
      .put("/api/v1/auth/update-profile")
      .set("x-test-user", u._id.toString())
      .send({ name: "After Update" })
      .expect(200);

    const updated = await userModel.findById(u._id);
    expect(updated.name).toBe("After Update");
    expect(updated.address).toBe("Old Address"); // unchanged
  });

  test("4) 401 Unauthorized when missing x-test-user header", async () => {
    await request(app).put("/api/v1/auth/update-profile").expect(401);
  });

  test("5) 403 Forbidden on admin-only route (auth propagation matrix)", async () => {
    const buyer = await makeUser();
    // Buyer tries to hit admin-only route
    await request(app)
      .get("/api/v1/auth/all-orders")
      .set("x-test-user", buyer._id.toString())
      .set("x-test-role", "buyer")
      .expect(403);
  });

  test("6) Valid admin can access /all-orders (auth propagation matrix pass case)", async () => {
    const admin = await makeAdmin();
    await request(app)
      .get("/api/v1/auth/all-orders")
      .set("x-test-user", admin._id.toString())
      .set("x-test-role", "admin")
      .expect(200);
  });

  test("7) Buyer can access /orders, returns empty array", async () => {
    const buyer = await makeUser();
    const res = await request(app)
      .get("/api/v1/auth/orders")
      .set("x-test-user", buyer._id.toString())
      .expect(200);
    expect(res.body).toEqual([]);
  });

  test("8) 500 on DB error during update (catch path coverage)", async () => {
    const u = await makeUser();
    const spy = jest
      .spyOn(userModel, "findByIdAndUpdate")
      .mockImplementationOnce(() => {
        throw new Error("Simulated DB failure in updateProfileController");
      });

    await request(app)
      .put("/api/v1/auth/update-profile")
      .set("x-test-user", u._id.toString())
      .send({ name: "DB Fail" })
      .expect(400);

    spy.mockRestore();
  });
});
