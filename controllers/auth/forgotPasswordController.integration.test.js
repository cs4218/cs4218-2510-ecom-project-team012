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

describe("POST /api/v1/auth/forgot-password", () => {
  // Setup for in-memory MongoDB
  beforeAll(async () => await connectTestDB(await createTestDB()));
  beforeEach(async () => {
    await userModel.create(testUser);
  });

  // Teardown for in-memory MongoDB
  afterEach(async () => await clearTestDB());
  afterAll(async () => await closeTestDB());

  it("should reset password if credentials and new password are valid", async () => {
    const oldPassword = '1234';
    const hashedOldPassword = await hashPassword(oldPassword);

    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: testUser.email,
        answer: testUser.answer,
        newPassword: "12345",
      });
    const hashedNewPassword = userModel.findOne({ email: testUser.email }).password;

    expect(hashedNewPassword).not.toBe(hashedOldPassword);
  });

  // tests integration with userModel since findOne and findByIdAndUpdate are called
  // no need to test hashPassword since integration testing has already been performed on authHelper methods
  // real hashPassword can thus be used --> bottom-up approach
  it("should respond with successful message if password is reset", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: testUser.email,
        answer: testUser.answer,
        newPassword: "12345",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // tests integration with userModel since no valid user found using userModel.findOne
  it("should respond with error message if email is not registered", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: "unregisteredemail@gmail.com",
        answer: testUser.answer,
        newPassword: "12345",
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

    // tests integration with userModel since wrong answer as found using userModel.findOne
  it("should respond with error message if answer is incorrect", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: testUser.email,
        answer: "wronganswer",
        newPassword: "12345",
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});