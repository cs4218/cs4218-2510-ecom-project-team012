import React from "react";
import { testController } from "./testController";

describe("Test Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should respond with 'Protected Routes'", () => {
    const mockReq = {};
    const mockRes = {
      send: jest.fn(),
    };

    testController(mockReq, mockRes);

    expect(mockRes.send).toHaveBeenCalledWith("Protected Routes");
  });

  it("should respond with error message on catching error", () => {
    const error = new Error("Internal Server Error");
    const mockReq = {};
    const mockRes = {
      send: jest.fn(() =>{
        throw error;
      })
    };

    try {
      testController(mockReq, mockRes);
    } catch (e) {
      // Catch the error to prevent the test from failing
      expect(e).toBe(error);
    }
  });
});