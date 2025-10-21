import request from "supertest";
import app from "../../server.js";
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../../tests/setupTestDB.js";
import userModel from "../../models/userModel.js";

const testUser = {
  "name": "abc",
  "email": "abc@gmail.com",
  "password": "1234",
  "phone": "1234",
  "address": "1234",
  "answer": "football",
  "dob": "2000-01-01",
}

describe("POST /api/v1/auth/register", () => {
  // Setup for in-memory MongoDB
  beforeAll(async () => await connectTestDB(await createTestDB()));

  // Teardown for in-memory MongoDB
  afterEach(async () => await clearTestDB());
  afterAll(async () => await closeTestDB());

  it("should update userModel if registration is successful", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      phone: testUser.phone,
      address: testUser.address,
      dob: testUser.dob,
      answer: testUser.answer,
    });
    const registeredUser = await userModel.findOne({ email: testUser.email });

    expect(registeredUser).not.toBeNull();
  });

  it("should respond with successful message if registration is successful", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      phone: testUser.phone,
      address: testUser.address,
      dob: testUser.dob,
      answer: testUser.answer,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should respond with error message if email is already registered", async () => {
    // register user
    await request(app).post("/api/v1/auth/register").send({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      phone: testUser.phone,
      address: testUser.address,
      dob: testUser.dob,
      answer: testUser.answer,
    });

    // register existing user
    const res = await request(app).post("/api/v1/auth/register").send({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      phone: testUser.phone,
      address: testUser.address,
      dob: testUser.dob,
      answer: testUser.answer,
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});