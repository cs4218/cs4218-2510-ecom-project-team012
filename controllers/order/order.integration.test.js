/**
 * End-to-end integration for order-related APIs with self-contained factories.
 */

import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import connectDB from "../../config/db.js";

import { getOrdersController } from "./getOrdersController.js";
import { getAllOrdersController } from "./getAllOrdersController.js";
import { orderStatusController } from "./orderStatusController.js";

import orderModel from "../../models/orderModel.js";
import userModel from "../../models/userModel.js";
import productModel from "../../models/productModel.js";

import { createTestDB, closeTestDB } from "../../tests/setupTestDB.js";

/* -------------------------- tiny test-only auth middlewares -------------------------- */
function fakeBuyerAuth(req, res, next) {
    const id = req.header("x-test-user");
    if (!id) return res.status(401).json({ error: "Unauthorized" });
    req.user = { _id: new mongoose.Types.ObjectId(id) };
    next();
}
function fakeAdminAuth(req, res, next) {
    const role = req.header("x-test-role");
    if (role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const uid = req.header("x-test-user");
    if (uid) req.user = { _id: new mongoose.Types.ObjectId(uid), role: "admin" };
    next();
}

/* ------------------------------------ factories ------------------------------------- */
async function makeUser(overrides = {}) {
  // Match required fields in your user schema (dob, phone, address, answer, etc.)
    const base = {
        name: "Test User",
        email: `user_${Date.now()}_${Math.random().toString(36).slice(2)}@ex.com`,
        password: "secret123", // hashing not required for these tests
        phone: "12345678",
        address: "123 Test Street",
        answer: "blue",
        dob: new Date("2000-01-01"),
        role: 0, // 0=buyer (adjust if your schema differs)
    };
    return userModel.create({ ...base, ...overrides });
}

async function makeAdmin(overrides = {}) {
    return makeUser({ role: 1, name: "Admin User", email: `admin_${Date.now()}@ex.com`, ...overrides });
}

async function makeProduct(overrides = {}) {
    const base = {
        name: "Widget",
        slug: `widget-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        description: "A useful widget",
        price: 42,
        // DO NOT include `photo` so we can test the "-photo" populate selection
        category: new mongoose.Types.ObjectId(), // only if your schema requires category
        quantity: 10,
        shipping: false,
    };
    return productModel.create({ ...base, ...overrides });
}

async function makeOrder({ buyer, products, status = "Processing", payment = { success: true } }) {
    return orderModel.create({
        products: products.map(p => p._id ?? p),
        payment,
        buyer: buyer._id ?? buyer,
        status,
    });
}

/* ----------------------------------- express app ------------------------------------ */
function makeApp() {
    const app = express();
    app.use(express.json());
    app.get("/api/v1/auth/orders", fakeBuyerAuth, getOrdersController);
    app.get("/api/v1/auth/all-orders", fakeAdminAuth, getAllOrdersController);
    app.put("/api/v1/auth/order-status/:orderId", fakeAdminAuth, orderStatusController);
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

// Fully isolate each test — database starts empty
beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

describe("Order APIs Integration (self-contained)", () => {
    test("1a) Buyer /orders → returns only that buyer’s orders; populated products(no photo) and buyer name", async () => {
        const buyerA = await makeUser({ name: "Buyer A" });
        const buyerB = await makeUser({ name: "Buyer B" });

        const p1 = await makeProduct({ name: "P1", price: 10 });
        const p2 = await makeProduct({ name: "P2", price: 20 });

        // One order for A (2 products), one for B (1 product)
        await makeOrder({ buyer: buyerA, products: [p1, p2], status: "Processing", payment: { success: true } });
        await makeOrder({ buyer: buyerB, products: [p1], status: "Not Process", payment: { success: false } });

        const res = await request(app)
        .get("/api/v1/auth/orders")
        .set("x-test-user", buyerA._id.toString())
        .expect(200);

        const list = res.body;
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBe(1);

        const o = list[0];
        expect(o?.buyer?.name).toBe("Buyer A");
        expect(Array.isArray(o.products)).toBe(true);
        expect(o.products).toHaveLength(2);
        expect(o.products[0]).toHaveProperty("name");
        expect(o.products[0]).not.toHaveProperty("photo"); // "-photo" in populate
    });

    test("1b) Buyer /orders → empty state if user has no orders", async () => {
        const noOrderUser = await makeUser({ name: "No Orders" });

        const res = await request(app)
        .get("/api/v1/auth/orders")
        .set("x-test-user", noOrderUser._id.toString())
        .expect(200);

        expect(res.body).toEqual([]);
    });

    test("1c) Buyer /orders → 401 when no auth header", async () => {
        await request(app).get("/api/v1/auth/orders").expect(401);
    });

    test("1d) Buyer /orders → 500 on DB error (covers catch path)", async () => {
    const buyer = await makeUser({ name: "Catcher Buyer" });

    // Mock the Mongoose model method directly
    const spy = jest.spyOn(orderModel, "find").mockImplementationOnce(() => {
        throw new Error("Simulated DB failure in getOrdersController");
    });

    await request(app)
        .get("/api/v1/auth/orders")
        .set("x-test-user", buyer._id.toString())
        .expect(500);

    spy.mockRestore();
    });

    test("2c) Admin /all-orders → 500 on DB error (covers catch path)", async () => {
    const admin = await makeAdmin();

    const spy = jest.spyOn(orderModel, "find").mockImplementationOnce(() => {
        throw new Error("Simulated DB failure in getAllOrdersController");
    });

    await request(app)
        .get("/api/v1/auth/all-orders")
        .set("x-test-role", "admin")
        .set("x-test-user", admin._id.toString())
        .expect(500);

    spy.mockRestore();
    });

    test("2a) Admin /all-orders → 403 for non-admin", async () => {
        await request(app).get("/api/v1/auth/all-orders").expect(403);
    });

    test("2b) Admin /all-orders → returns all orders sorted by createdAt DESC", async () => {
        const admin = await makeAdmin();
        const buyer = await makeUser();
        const p = await makeProduct();

        // Older then newer (set createdAt explicitly)
        const older = await makeOrder({ buyer, products: [p], status: "Processing" });
        const newer = await makeOrder({ buyer, products: [p], status: "Processing" });

        await orderModel.updateOne({ _id: older._id }, { $set: { createdAt: new Date("2024-01-01T00:00:00Z") } });
        await orderModel.updateOne({ _id: newer._id }, { $set: { createdAt: new Date("2024-02-01T00:00:00Z") } });

        const res = await request(app)
        .get("/api/v1/auth/all-orders")
        .set("x-test-role", "admin")
        .set("x-test-user", admin._id.toString())
        .expect(200);

        const list = res.body;
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThanOrEqual(2);

        // Descending by createdAt
        for (let i = 1; i < list.length; i++) {
        const prev = new Date(list[i - 1].createdAt).getTime();
        const cur = new Date(list[i].createdAt).getTime();
        expect(prev).toBeGreaterThanOrEqual(cur);
        }

        const first = list[0];
        expect(first?.buyer?.name).toBeDefined();
        expect(Array.isArray(first?.products)).toBe(true);
        if (first.products[0]) {
        expect(first.products[0].name).toBeDefined();
        expect(first.products[0].photo).toBeUndefined();
        }
    });

    test("3a) PUT /order-status/:id → updates status (enum transition), then to cancel", async () => {
        const admin = await makeAdmin();
        const buyer = await makeUser();
        const p = await makeProduct();
        const ord = await makeOrder({ buyer, products: [p], status: "Processing" });

        const r1 = await request(app)
        .put(`/api/v1/auth/order-status/${ord._id}`)
        .set("x-test-role", "admin")
        .set("x-test-user", admin._id.toString())
        .send({ status: "Shipped" })
        .expect(200);

        expect(r1.body?.status).toBe("Shipped");

        const r2 = await request(app)
        .put(`/api/v1/auth/order-status/${ord._id}`)
        .set("x-test-role", "admin")
        .send({ status: "cancel" })
        .expect(200);

        expect(r2.body?.status).toBe("cancel");
    });

    test("3b) PUT /order-status/:id → 404 for invalid id", async () => {
        const admin = await makeAdmin();
        const invalidId = new mongoose.Types.ObjectId();
        await request(app)
        .put(`/api/v1/auth/order-status/${invalidId}`)
        .set("x-test-role", "admin")
        .set("x-test-user", admin._id.toString())
        .send({ status: "Processing" })
        .expect(404);
    });
    test("3c) PUT /order-status/:id → 500 on DB error (covers catch path)", async () => {
    // Create a valid order first so we have a real id
    const admin = await makeAdmin();
    const buyer = await makeUser();
    const p = await makeProduct();
    const ord = await makeOrder({ buyer, products: [p], status: "Processing" });

    // Force the controller's update call to throw
    const spy = jest
        .spyOn(orderModel, "findByIdAndUpdate")
        .mockImplementationOnce(() => {
        throw new Error("Simulated DB failure in orderStatusController");
        });

    await request(app)
        .put(`/api/v1/auth/order-status/${ord._id}`)
        .set("x-test-role", "admin")
        .set("x-test-user", admin._id.toString())
        .send({ status: "Shipped" })
        .expect(500);

    spy.mockRestore();
    });
});
