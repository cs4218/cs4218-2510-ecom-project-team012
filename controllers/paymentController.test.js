// General structure generated with the help of AI

// Create mocks before imports
const mockGateway = {
  clientToken: {
    generate: jest.fn(),
  },
  transaction: {
    sale: jest.fn(),
  },
};

const mockBraintreeGateway = jest.fn(() => mockGateway);
const mockEnvironment = { Sandbox: "sandbox" };

// Mock braintree module
jest.mock("braintree", () => ({
  BraintreeGateway: mockBraintreeGateway,
  Environment: mockEnvironment,
}));

// Mock orderModel
const mockSave = jest.fn();
const mockOrderModel = jest.fn((data) => ({ 
  ...data,
  save: mockSave,
}));

jest.mock("../models/orderModel.js", () => mockOrderModel);

// Mock dotenv
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Import controllers after mocks are set up
const {
  braintreeTokenController,
  brainTreePaymentController,
} = require("./paymentController.js");

describe("Payment Controller Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockSave.mockResolvedValue({ _id: "order123" });

    // Setup mock request and response
    mockReq = {
      body: {},
      user: { _id: "user123" },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  describe("braintreeTokenController", () => {
    it("should generate and send client token successfully", async () => {
      const mockResponse = { clientToken: "mock-token-12345" };

      // Mock successful token generation
      mockGateway.clientToken.generate.mockImplementation((options, callback) => {
        callback(null, mockResponse);
      });

      await braintreeTokenController(mockReq, mockRes);

      expect(mockGateway.clientToken.generate).toHaveBeenCalledWith(
        {},
        expect.any(Function)
      );
      expect(mockRes.send).toHaveBeenCalledWith(mockResponse);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should handle error when token generation fails", async () => {
      const mockError = new Error("Token generation failed");

      // Mock failed token generation
      mockGateway.clientToken.generate.mockImplementation((options, callback) => {
        callback(mockError, null);
      });

      await braintreeTokenController(mockReq, mockRes);

      expect(mockGateway.clientToken.generate).toHaveBeenCalledWith(
        {},
        expect.any(Function)
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(mockError);
    });

    it("should handle exception during token generation", async () => {
      // Mock gateway to throw an exception
      mockGateway.clientToken.generate.mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      // Use console.log spy to verify error logging
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      await braintreeTokenController(mockReq, mockRes);

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });
  });

  describe("brainTreePaymentController", () => {
    beforeEach(() => {
      // Reset orderModel mock
      mockOrderModel.mockClear();
      mockSave.mockClear();
      mockSave.mockResolvedValue({ _id: "order123" });
    });

    it("should process payment successfully and create order", async () => {
      const mockCart = [
        { _id: "product1", name: "Product 1", price: 100 },
        { _id: "product2", name: "Product 2", price: 200 },
      ];

      const mockNonce = "fake-valid-nonce";
      const mockResult = {
        success: true,
        transaction: {
          id: "transaction123",
          amount: "300.00",
        },
      };

      mockReq.body = {
        nonce: mockNonce,
        cart: mockCart,
      };

      // Mock successful payment
      mockGateway.transaction.sale.mockImplementation(
        (transactionData, callback) => {
          callback(null, mockResult);
        }
      );

      await brainTreePaymentController(mockReq, mockRes);

      expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
        {
          amount: 300,
          paymentMethodNonce: mockNonce,
          options: {
            submitForSettlement: true,
          },
        },
        expect.any(Function)
      );

      expect(mockOrderModel).toHaveBeenCalledWith({
        products: mockCart,
        payment: mockResult,
        buyer: "user123",
      });

      expect(mockRes.json).toHaveBeenCalledWith({ ok: true });
    });

    it("should calculate total correctly for multiple items", async () => {
      const mockCart = [
        { price: 50 },
        { price: 75 },
        { price: 125 },
      ];

      mockReq.body = {
        nonce: "fake-nonce",
        cart: mockCart,
      };

      mockGateway.transaction.sale.mockImplementation(
        (transactionData, callback) => {
          callback(null, { success: true });
        }
      );

      await brainTreePaymentController(mockReq, mockRes);

      expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 250, // 50 + 75 + 125
        }),
        expect.any(Function)
      );
    });

    it("should handle payment failure", async () => {
      const mockCart = [{ price: 100 }];
      const mockNonce = "fake-invalid-nonce";
      const mockError = new Error("Payment declined");

      mockReq.body = {
        nonce: mockNonce,
        cart: mockCart,
      };

      // Mock failed payment
      mockGateway.transaction.sale.mockImplementation(
        (transactionData, callback) => {
          callback(mockError, null);
        }
      );

      await brainTreePaymentController(mockReq, mockRes);

      expect(mockGateway.transaction.sale).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(mockError);
      expect(mockOrderModel).not.toHaveBeenCalled();
    });

    it("should handle empty cart", async () => {
      const mockCart = [];
      mockReq.body = {
        nonce: "fake-nonce",
        cart: mockCart,
      };

      mockGateway.transaction.sale.mockImplementation(
        (transactionData, callback) => {
          callback(null, { success: true });
        }
      );

      await brainTreePaymentController(mockReq, mockRes);

      expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 0, // Empty cart should have 0 total
        }),
        expect.any(Function)
      );
    });

    it("should handle exception during payment processing", async () => {
      mockReq.body = {
        nonce: "fake-nonce",
        cart: [{ price: 100 }],
      };

      // Mock gateway to throw an exception
      mockGateway.transaction.sale.mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      // Use console.log spy to verify error logging
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      await brainTreePaymentController(mockReq, mockRes);

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it("should include correct user ID in order", async () => {
      const testUserId = "user456";
      mockReq.user = { _id: testUserId };
      mockReq.body = {
        nonce: "fake-nonce",
        cart: [{ price: 100 }],
      };

      mockGateway.transaction.sale.mockImplementation(
        (transactionData, callback) => {
          callback(null, { success: true });
        }
      );

      await brainTreePaymentController(mockReq, mockRes);

      expect(mockOrderModel).toHaveBeenCalledWith(
        expect.objectContaining({
          buyer: testUserId,
        })
      );
    });

    it("should pass payment options correctly", async () => {
      mockReq.body = {
        nonce: "fake-nonce",
        cart: [{ price: 100 }],
      };

      mockGateway.transaction.sale.mockImplementation(
        (transactionData, callback) => {
          callback(null, { success: true });
        }
      );

      await brainTreePaymentController(mockReq, mockRes);

      expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
        expect.objectContaining({
          options: {
            submitForSettlement: true,
          },
        }),
        expect.any(Function)
      );
    });
  });
});
