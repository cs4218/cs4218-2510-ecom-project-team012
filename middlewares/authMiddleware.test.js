import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { requireSignIn, isAdmin } from "./authMiddleware.js";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js");

describe("requireSignIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockReq = { headers: { authorization: 'token' }, user: null };
  const next = jest.fn();
 
  it("should set the user's credentials if verification is successful", async () => {
    const mockRes = {};
    jsonwebtoken.JWT.verify.mockReturnValue({ name: 'testUser' });

    await requireSignIn(mockReq, mockRes, next);

    // expect(JWT.verify).toHaveBeenCalledWith('token', process.env.JWT_SECRET);
    expect(mockReq.user).toEqual({ name: 'testUser' });
    expect(next).toHaveBeenCalled();
  });

  it("should send response with unsuccessful message if error is caught", async () => {
    const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    JWT.verify.mockImplementation(() => { throw new Error("Invalid token") });

    await requireSignIn(mockReq, mockRes, next);
    
    expect(mockReq.user).toBeNull();
    expect(next).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    // not using exact message as it may change in future
    expect(mockRes.send).toHaveBeenCalledTimes(1);
  });

  // test isAdmin 
  describe("isAdmin", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const next = jest.fn();

    it("should allow user to continue if user is admin", async () => {
      const testUser = { _id: 'testId', role: 1 }
      const mockReq = { user: testUser };
      const mockRes = {};
      userModel.findById.mockResolvedValue(testUser);
      
      await isAdmin(mockReq, mockRes, next);

      expect(next).toHaveBeenCalled();
    });

    it("should send response with message with HTTP code 401 Unauthorized if user is not admin", async () => {
      const testUser = { _id: 'testId', role: 0 }
      const mockReq = { user: testUser };
      const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      userModel.findById.mockResolvedValue(testUser);

      await isAdmin(mockReq, mockRes, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      // not using exact message as it may change in future
      expect(mockRes.send).toHaveBeenCalledTimes(1);
    });

    it("should send response with unsuccessful message if error is caught", async () => {
      const mockReq = { user: { _id: 'invalidId', role: 1 } };
      const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      userModel.findById.mockRejectedValue(new Error("Invalid user ID"));

      await isAdmin(mockReq, mockRes, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      // not using exact message as it may change in future
      expect(mockRes.send).toHaveBeenCalledTimes(1);
    });
  });
});
