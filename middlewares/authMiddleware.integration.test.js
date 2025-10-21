import request from "supertest";
import app from "../server.js"
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../tests/setupTestDB.js";
import { seedTestData } from "../tests/seedTestData.js";

const testUser = {
    name: "CS 4218 Test Account",
    email: "cs4218@test.com",
    password: "$2b$10$//wWsN./fEX1WiipH57HG.SAwgkYv1MRrPSkpXM38Dy5seOEhCoUy",
    phone: "81234567",
    address: "1 Computing Drive",
    answer: "password is cs4218@test.com",
    dob: "2000-01-01T00:00:00.000Z",
}

describe("GET /api/v1/auth/user-auth", () => {
  // Setup for in-memory MongoDB
  beforeAll(async () => {
    await connectTestDB(await createTestDB());
  });

  // Teardown for in-memory MongoDB
  afterAll(async () => await closeTestDB());

  it("should send response with success message if verification is successful", async () => {
    const user = await userModel.create(testUser);
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET);

    const res = await request(app)
      .get("/api/v1/auth/user-auth")
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe("GET /api/v1/auth/admin-auth", () => {
  // Setup for in-memory MongoDB
  beforeAll(async () => {
    await connectTestDB(await createTestDB());
    await seedTestData();
  });

  // Teardown for in-memory MongoDB
  afterEach(async () => await clearTestDB());
  afterAll(async () => await closeTestDB());

  it("should send response with success message if admin verification is successful", async () => {
    const adminUser = await userModel.findOne({ role: 1 });
    const token = JWT.sign({ _id: adminUser._id }, process.env.JWT_SECRET);

    const res = await request(app)
      .get("/api/v1/auth/admin-auth")
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});