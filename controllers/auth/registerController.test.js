import React from "react";
import { registerController } from "./registerController";
import userModel from "../../models/userModel";
import { hashPassword } from "../../helpers/authHelper";

jest.mock("../../models/userModel", () => {
  const mockUserModel = jest.fn().mockImplementation(() => ({
    save: jest.fn(), 
  }));

  // Mock static methods
  mockUserModel.findOne = jest.fn();
  mockUserModel.findByIdAndUpdate = jest.fn();

  return mockUserModel;
});

jest.mock("../../helpers/authHelper", () => ({
  hashPassword: jest.fn(),
}));

describe("Register Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  it("should successfully register user", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Test St",
        dob: "2000-01-01",
        answer: "Test Answer",
      },
    };

    userModel.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashedPassword");
    const user = userModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
          _id: "userId",
          ...req.body,
          password: "hashedPassword",
        }),
      }));

    await registerController(req, res);

    expect(user).toBeDefined();
  });

  it("should respond with success message if user is successfully registered", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Test St",
        dob: "2000-01-01",
        answer: "Test Answer",
      },
    };

    userModel.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashedPassword");
    userModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        _id: "userId",
        ...req.body,
        password: "hashedPassword",
      }),
    }));

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, })
    );
  });

  it("should respond with unsuccessful message if name is missing", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Test St",
        dob: "2000-01-01",
        answer: "Test Answer",
      },
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

    it("should respond with unsuccessful message if email is missing", async () => {
    const req = {
      body: {
        name: "Test User",
        password: "password123",
        phone: "1234567890",
        address: "123 Test St",
        dob: "2000-01-01",
        answer: "Test Answer",
      },
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if password is missing", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        address: "123 Test St",
        dob: "2000-01-01",
        answer: "Test Answer",
      },
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if phone is missing", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        address: "123 Test St",
        dob: "2000-01-01",
        answer: "Test Answer",
      },
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if address is missing", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        dob: "2000-01-01",
        answer: "Test Answer",
      },
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if date of birth is missing", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Test St",
        answer: "Test Answer",
      },
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if answer to security question is missing", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Test St",
        dob: "2000-01-01",
      },
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if email is already registered", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Test St",
        dob: "2000-01-01",
        answer: "Test Answer",
      },
    };

    userModel.findOne.mockResolvedValue({ email: "test@example.com" });
    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with an error message if error is caught", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Test St",
        dob: "2000-01-01",
        answer: "Test Answer",
      },
    };
    const error = new Error("Database error");

    userModel.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashedPassword");
    userModel.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(error),
    }));

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ 
        success: false, 
        error,
      })
    );
  });
});