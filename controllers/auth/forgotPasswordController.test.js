import React from "react";
import { forgotPasswordController } from "./forgotPasswordController";
import userModel from "../../models/userModel";
import { hashPassword } from "../../helpers/authHelper";

jest.mock("../../models/userModel", () => ({
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../../helpers/authHelper", () => ({
  hashPassword: jest.fn(),
}));

describe("Forgot Password Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  it("should successfully reset password", async () => {
    const req = {
      body: {
        email: "test@example.com",
        answer: "testAnswer",
        newPassword: "newTestPassword",
      },
    };
    userModel.findOne.mockResolvedValue({ _id: "userId" });
    hashPassword.mockResolvedValue("hashedPassword");
    userModel.findByIdAndUpdate.mockResolvedValue(true);

    await forgotPasswordController(req, res);

    expect(hashPassword).toHaveBeenCalledWith("newTestPassword");
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "userId",
      { password: "hashedPassword" }
    );
  });

  it("should respond with successful message if password is reset", async () => {
    const req = {
      body: {
        email: "test@example.com",
        answer: "testAnswer",
        newPassword: "newTestPassword",
      },
    };

    userModel.findOne.mockResolvedValue({ _id: "userId" });
    hashPassword.mockResolvedValue("hashedPassword");
    userModel.findByIdAndUpdate.mockResolvedValue(true);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    // response should minimally contain a success flag but message may change
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, })
    );
  });

  it("should respond with unsuccessful message if email is not provided", async () => {
    const req = {
      body: {
        answer: "testAnswer",
        newPassword: "newTestPassword",
      },
    };

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
        // response should minimally contain a success flag but message may change 
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if answer is not provided", async () => {
    const req = {
      body: {
        email: "test@example.com",
        newPassword: "newTestPassword",
      },
    };

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
        // response should minimally contain a success flag but message may change 
      expect.objectContaining({ success: false, })
  });

  it("should respond with unsuccessful message if new password is not provided", async () => {
    const req = {
      body: {
        email: "test@example.com",
        answer: "testAnswer",
      },
    };

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
        // response should minimally contain a success flag but message may change 
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with unsuccessful message if email is wrong", async () => {
    const req = {
      body: {
        email: "wrong@example.com",
        answer: "testAnswer",
        newPassword: "newTestPassword",
      },
    };

    userModel.findOne.mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
        // response should minimally contain a success flag but message may change 
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

    it("should respond with unsuccessful message if answer is wrong", async () => {
    const req = {
      body: {
        email: "test@example.com",
        answer: "wrongAnswer",
        newPassword: "newTestPassword",
      },
    };

    userModel.findOne.mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    // response should minimally contain a success flag but message may change 
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });

  it("should respond with error message if error is caught", async () => {
    const req = {
      body: {
        email: "test@example.com",
        answer: "testAnswer",
        newPassword: "newTestPassword",
      },
    };

    const error = new Error("Database error");
    userModel.findOne.mockRejectedValue(error);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    // response should minimally contain a success flag but message may change 
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, })
    );
  });
});
