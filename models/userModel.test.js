import mongoose from "mongoose";
import userModel from "./userModel.js";

describe("User Model", () => {
    it("should create a user with min required fields", async () => {
        const validUser = new userModel({
            name: "Test User",
            email: "testuser@gmail.com",
            password: "password123",
            phone: "1234567890",
            address: { street: "123 Test St", city: "Testville" },
            answer: "Test Answer",
        });
        await expect(validUser.validate()).resolves.toBeUndefined();
        expect(validUser.name).toBe("Test User");
        expect(validUser.email).toBe("testuser@gmail.com");
        expect(validUser.password).toBe("password123");
        expect(validUser.phone).toBe("1234567890");
        expect(validUser.address).toEqual({ street: "123 Test St", city: "Testville" });
        expect(validUser.answer).toBe("Test Answer");
        expect(validUser.role).toBe(0); // default value
    });

    it("should fail validation if required fields are missing", async () => {
        const invalidUser = new userModel({});
        await expect(invalidUser.validate()).rejects.toBeInstanceOf(
            mongoose.Error.ValidationError
        );
        await expect(invalidUser.validate()).rejects.toMatchObject({
            errors: {
            name: expect.anything(),
            email: expect.anything(),
            password: expect.anything(),
            phone: expect.anything(),
            address: expect.anything(),
            answer: expect.anything(),
            },
        });
    });

    it("should fail to create a user without name", async () => {
        const invalidUser = new userModel({
            email: "testuser@gmail.com",
            password: "password123",
            phone: "1234567890",
            address: { street: "123 Test St", city: "Testville" },
            answer: "Test Answer"
        });

        await expect(invalidUser.validate()).rejects.toMatchObject({
        errors: {
            name: expect.objectContaining({
            kind: "required",
            path: "name",
            }),
        },
        });
    });

    it("should fail to create a user without email", async () => {
        const invalidUser = new userModel({
            name: "Test User",
            password: "password123",
            phone: "1234567890",
            address: { street: "123 Test St", city: "Testville" },
            answer: "Test Answer"
        });

        await expect(invalidUser.validate()).rejects.toMatchObject({
        errors: {
            email: expect.objectContaining({
            kind: "required",
            path: "email",
            }),
        },
        });
    });

    it("should fail to create a user without password", async () => {
        const invalidUser = new userModel({
            name: "Test User",
            email: "testuser@gmail.com",
            phone: "1234567890",
            address: { street: "123 Test St", city: "Testville" },
            answer: "Test Answer"
        });

        await expect(invalidUser.validate()).rejects.toMatchObject({
        errors: {
            password: expect.objectContaining({
            kind: "required",
            path: "password",
            }),
        },
        });
    });

    it("should create a user with role when provided", async () => {
        const validUser = new userModel({
            name: "Admin User",
            email: "testuser@gmail.com",
            phone: "1234567890",
            address: { street: "123 Test St", city: "Testville" },
            answer: "Test Answer",
            password: "password123",
            role: 1,
        });
        await expect(validUser.validate()).resolves.toBeUndefined();
        expect(validUser.role).toBe(1);
    });

    // Trim name field 
    // More of a Mongoose feature test than a schema test, but good to validate
    it("should create user with name trimmed", async () => {
        const userWithSpaces = new userModel({
            name: "   Test User   ",
            email: "testuser@gmail.com",
            phone: "1234567890",
            address: { street: "123 Test St", city: "Testville" },
            answer: "Test Answer",
            password: "password123",
        });
        await expect(userWithSpaces.validate()).resolves.toBeUndefined();
        expect(userWithSpaces.name).toBe("Test User");
    });
});
