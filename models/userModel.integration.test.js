import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../tests/setupTestDB.js";

// General structure generated with the help of AI

// Tested DB operations used of user model
// findOne, findByIdAndUpdate

const testUser1 = {
  name: "John Doe",
  email: "john@example.com",
  password: "securePass123",
  phone: "91234567",
  address: { street: "123 Street", city: "Singapore" },
  answer: "Blue",
  dob: new Date("2000-01-01"),
};

describe("User Model Integration", () => {
  // Setup for in-memory MongoDB
  beforeAll(async () => await connectTestDB(await createTestDB()));

  // Teardown for in-memory MongoDB
  afterEach(async () => await clearTestDB());
  afterAll(async () => await closeTestDB());

  it("should save a valid user to the database", async () => {
    // Arrange
    const user = new userModel(testUser1);

    // Act
    const savedUser = await user.save();
    const found = await userModel.findById(savedUser._id);

    // Assert
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(testUser1.email);
    expect(found).not.toBeNull();
    expect(found.name).toBe(testUser1.name);
    expect(found.dob).toEqual(testUser1.dob);
    expect(found.address).toEqual(testUser1.address);
    expect(found.answer).toBe(testUser1.answer);
    expect(found.role).toBe(0); // Ensure that it goes to default value when omitted from input
  });

  it("should not save a user without required fields", async () => {
    // Arrange
    const invalidUser = new userModel({
      email: "missingfields@example.com",
      password: "12345",
    });

    // Act & Assert
    await expect(invalidUser.save()).rejects.toBeInstanceOf(
      mongoose.Error.ValidationError
    );
  });

  it("should search for a user by email", async () => {
    // Arrange
    const user = new userModel(testUser1);
    await user.save();

    // Act
    const found = await userModel.findOne({ email: testUser1.email });

    // Assert
    expect(found).not.toBeNull();
    expect(found.name).toBe(testUser1.name);
  });

  it("should not save a user with duplicate email", async () => {
    // Arrange
    const user1 = new userModel(testUser1);
    await user1.save();

    const user2 = new userModel({
      ...testUser1,
      name: "Jane Doe",
    });

    // Act & Assert
    await expect(user2.save()).rejects.toThrow(/duplicate key/);
  });

  it("should mantain data consistency after update", async () => {
    // Arrange
    const user = new userModel(testUser1);
    const savedUser = await user.save();

    // Act
    savedUser.phone = "99887766";
    const updatedUser = await savedUser.save();
    const found = await userModel.findById(updatedUser._id);

    // Assert
    expect(updatedUser.phone).toBe("99887766");
    expect(found).not.toBeNull();
    expect(found.phone).toBe("99887766");
  });

  it("should handle user deletion correctly", async () => {
    // Arrange
    const user = new userModel(testUser1);
    const savedUser = await user.save();

    // Act
    await userModel.findByIdAndDelete(savedUser._id);
    const found = await userModel.findById(savedUser._id);

    // Assert
    expect(found).toBeNull();
  });
});