// __tests__/integration/paymentController.integration.test.js

import request from 'supertest';
import app from '../server.js'; 
import orderModel from '../models/orderModel.js';
import braintree from 'braintree';
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../tests/setupTestDB.js";

// General setup generated with the help of AI

// Mock Braintree to prevent actual API calls during tests
jest.mock('braintree');

describe('Payment Controller - Integration Tests', () => {
  // Setup for in-memory MongoDB
  beforeAll(async () => await connectTestDB(await createTestDB()));

  // Teardown for in-memory MongoDB
  afterEach(async () => await clearTestDB());
  afterAll(async () => await closeTestDB());

  describe('Authentication and Access', () => {
    let braintreeTransactionMock;
    
    beforeAll(() => {
      // Set up Braintree mock
      braintreeTransactionMock = {
        sale: jest.fn()
      };
      
      braintree.BraintreeGateway.mockImplementation(() => ({
        transaction: braintreeTransactionMock,
        clientToken: {
          generate: jest.fn()
        }
      }));
    });

    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks(); // critical cleanup step
    });

    describe('POST /api/v1/payment/braintree/payment - Unauthenticated payment', () => {
      it('should return 401 when payment is attempted without authorization', async () => {
        // Arrange
        const paymentData = {
          nonce: 'fake-valid-nonce',
          cart: [
            { _id: '123', name: 'Product 1', price: 100 },
            { _id: '456', name: 'Product 2', price: 200 }
          ]
        };

        // Act
        const response = await request(app)
          .post('/api/v1/payment/braintree/payment')
          .send(paymentData);
        
        // Assert
        expect(response.status).toBe(401);
        
        // Verify Braintree was NOT called
        expect(braintreeTransactionMock.sale).not.toHaveBeenCalled();
        
        // Verify no order was persisted
        const orderCount = await orderModel.countDocuments({});
        expect(orderCount).toBe(0);
      }, 10000); // Increase timeout to 10 seconds

      it('should not create transaction when no auth token is provided', async () => {
        // Arrange
        const paymentData = {
          nonce: 'fake-nonce-123',
          cart: [
            { _id: '789', name: 'Product 3', price: 50 }
          ]
        };

        // Act
        await request(app)
          .post('/api/v1/payment/braintree/payment')
          .send(paymentData);
        
        // Assert - Verify no Braintree transaction was initiated
        expect(braintreeTransactionMock.sale).toHaveBeenCalledTimes(0);
      }, 10000);

      it('should not persist order in database when unauthenticated', async () => {
        // Arrange
        const paymentData = {
          nonce: 'test-nonce',
          cart: [
            { _id: '999', name: 'Product 4', price: 150 }
          ]
        };

        // Act
        await request(app)
          .post('/api/v1/payment/braintree/payment')
          .send(paymentData);
        
        // Assert - Verify no orders exist in database
        const orders = await orderModel.find({});
        expect(orders).toHaveLength(0);
      }, 10000);
    });

    // Placeholder for future authenticated payment tests
    describe('POST /api/v1/payment/braintree/payment - Authenticated payment', () => {
      it.todo('should return 200 when payment is successful with valid auth token');
      it.todo('should call Braintree transaction.sale with correct parameters');
      it.todo('should persist order in database after successful payment');
    });

    // Placeholder for future token endpoint tests
    describe('GET /api/v1/payment/braintree/payment/token', () => {
      it.todo('should return client token when authenticated');
      it.todo('should return 401 when requesting token without authentication');
    });

    // Placeholder for future validation tests
    describe('POST /api/v1/payment/braintree/payment - Validation', () => {
      it.todo('should return 400 when nonce is missing');
      it.todo('should return 400 when cart is empty');
      it.todo('should return 400 when cart items are invalid');
    });

    // Placeholder for future error handling tests
    describe('POST /api/v1/payment/braintree/payment - Error Handling', () => {
      it.todo('should return 500 when Braintree transaction fails');
      it.todo('should not persist order when Braintree transaction fails');
      it.todo('should handle database errors gracefully');
    });
  });
});
