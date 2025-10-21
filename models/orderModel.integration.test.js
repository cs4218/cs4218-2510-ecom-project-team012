import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Order from "./orderModel.js";

// Minimal models to support ref population used by orderModel
const ProductSchema = new mongoose.Schema({ name: String, price: Number });
const UserSchema = new mongoose.Schema({ name: String, email: String });

const Product = mongoose.model("Products", ProductSchema); // note: name matches orderModel ref
const User = mongoose.model("users", UserSchema);          // note: name matches orderModel ref

jest.setTimeout(30000);

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    dbName: "test-order-model",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  // clean up collections between tests
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

describe("Order Model (integration)", () => {
  test("creates an order with defaults and timestamps", async () => {
    const user = await User.create({ name: "Buyer A", email: "a@a.com" });
    const p1 = await Product.create({ name: "Laptop", price: 1200 });

    const order = await Order.create({
      products: [p1._id],
      buyer: user._id,
      payment: { success: true, provider: "stripe", amount: 1200 },
      // status omitted to use default
    });

    expect(order).toBeDefined();
    expect(order.status).toBe("Not Process"); // default from schema
    expect(Array.isArray(order.products)).toBe(true);
    expect(order.products[0].toString()).toBe(p1._id.toString());

    // timestamps
    expect(order.createdAt instanceof Date).toBe(true);
    expect(order.updatedAt instanceof Date).toBe(true);
  });

  test("rejects invalid status values (enum validation)", async () => {
    const user = await User.create({ name: "Bad Buyer", email: "bad@a.com" });

    await expect(
      Order.create({
        buyer: user._id,
        status: "Totally Invalid", // not in enum
      })
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  test("allows all valid status transitions and persists them", async () => {
    const user = await User.create({ name: "Buyer B", email: "b@b.com" });
    const p = await Product.create({ name: "Mic", price: 80 });

    const order = await Order.create({
      products: [p._id],
      buyer: user._id,
      payment: {},
      status: "Not Process",
    });

    const validStatuses = ["Not Process", "Processing", "Shipped", "deliverd", "cancel"];

    for (const s of validStatuses) {
      order.status = s;
      await expect(order.save()).resolves.toBeDefined();
      expect(order.status).toBe(s);
    }
  });

  test("stores arbitrary payment object as provided", async () => {
    const user = await User.create({ name: "Buyer C", email: "c@c.com" });

    const paymentPayload = {
      success: false,
      gateway: "paypal",
      reason: "Card declined",
      meta: { attempt: 2 },
    };

    const order = await Order.create({
      buyer: user._id,
      products: [],
      payment: paymentPayload,
    });

    // Since payment is a loose object, ensure it round-trips
    expect(order.payment).toMatchObject(paymentPayload);
  });

  test("supports multiple products & population of refs", async () => {
    const [p1, p2, p3] = await Product.create(
      [
        { name: "A", price: 10 },
        { name: "B", price: 20 },
        { name: "C", price: 30 },
      ].map((d) => d)
    );
    const user = await User.create({ name: "Buyer D", email: "d@d.com" });

    const created = await Order.create({
      products: [p1._id, p2._id, p3._id],
      buyer: user._id,
      payment: { success: true },
      status: "Processing",
    });

    const populated = await Order.findById(created._id)
      .populate("products")
      .populate("buyer")
      .lean();

    expect(populated.products.map((p) => p.name)).toEqual(["A", "B", "C"]);
    expect(populated.buyer.name).toBe("Buyer D");
    expect(populated.status).toBe("Processing");
  });

  test("allows empty products array and still saves", async () => {
    const user = await User.create({ name: "Buyer E", email: "e@e.com" });

    const order = await Order.create({
      products: [], // empty allowed
      buyer: user._id,
      payment: {},
    });

    expect(order.products).toHaveLength(0);
    expect(order.status).toBe("Not Process");
  });
});
