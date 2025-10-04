import React from "react";
import { loginController } from "./loginController";
import userModel from "../../models/userModel";
import { comparePassword } from "../../helpers/authHelper";
import JWT from "jsonwebtoken";
jest.mock("jsonwebtoken")

jest.mock("../../models/userModel", () => ({
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../../helpers/authHelper", () => ({
  comparePassword: jest.fn(),
}));

describe("Login Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  it("should successfully login user", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    userModel.findOne.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
      password: "hashedPassword",
    });
    comparePassword.mockResolvedValue(true);
    JWT.sign.mockReturnValue("token");

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, })
    );
  });

  it("should respond with unsuccessful message if email is missing", async () => {
    const req = {
      body: {
        password: "password123",
      },
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    // response should have success flag minimally
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if password is missing", async () => {
    const req = {
      body: {
        email: "test@example.com",
      },
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    // response should have success flag minimally
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if email is not registered", async () => {
    const req = {
      body: {
        email: "unregistered@example.com",
        password: "password123",
      },
    };

    userModel.findOne.mockResolvedValue(null);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    // response should have success flag minimally
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if password entered does not match stored password", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "wrongPassword",
      },
    };

    userModel.findOne.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
      password: "hashedPassword",
    });
    comparePassword.mockResolvedValue(false);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    // response should have success flag minimally
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with error message if error is caught", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };
    const error = new Error("JWT Error");
    
    userModel.findOne.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
      password: "hashedPassword",
    });
    comparePassword.mockResolvedValue(true);
    JWT.sign.mockRejectedValue(error);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    // response should have success flag minimally
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error })
    );
  });
});
