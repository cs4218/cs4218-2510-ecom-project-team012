import request from "supertest";
import app from "../../server.js";
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../../tests/setupTestDB.js";
import userModel from "../../models/userModel.js";
import { hashPassword } from "../../helpers/authHelper.js";

const testUser = {
  "name": "abc",
  "email": "abc@gmail.com",
  "password": "1234",
  "phone": "1234",
  "address": "1234",
  "answer": "football",
  "dob": "2000-01-01",
}

describe("POST /api/v1/auth/login", () => {
  // Setup for in-memory MongoDB
  beforeAll(async () => {
    await connectTestDB(await createTestDB());
    const hashedPassword = await hashPassword(testUser.password);
    await userModel.create({ ...testUser, password: hashedPassword });
  });

  // Teardown for in-memory MongoDB
  afterEach(async () => await clearTestDB());
  afterAll(async () => await closeTestDB());

  it("should respond with successful message if login is successful", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should respond with error message if email is not registered", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "unregisteredemail@gmail.com",
        password: testUser.password,
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should respond with error message if password is incorrect", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});