import request from 'supertest';
import express from 'express';
import { createTestDB, connectTestDB, disconnectTestDB, closeTestDB } from '../../tests/setupTestDB.js';
import authRoutes from '../../routes/authRoute.js';
import categoryRoutes from '../../routes/categoryRoutes.js';
import productRoutes from '../../routes/productRoutes.js';
import orderRoutes from '../../routes/orderRoute.js';
import paymentRoutes from '../../routes/paymentRoutes.js';

let app;
let server;
let mongoUri;

describe('Authentication Security Tests', () => {
  beforeAll(async () => {
    // Setup test database
    mongoUri = await createTestDB();
    await connectTestDB(mongoUri);

    // Create Express app
    app = express();
    app.use(express.json());
    
    // Mount routes
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/category', categoryRoutes);
    app.use('/api/v1/product', productRoutes);
    app.use('/api/v1/order', orderRoutes);
    app.use('/api/v1/payments', paymentRoutes);
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('Protected Endpoints Access Tests', () => {
    // User Profile Endpoints
    describe('User Profile Endpoints', () => {
      it('should deny access to user profile without authentication', async () => {
        const response = await request(app).get('/api/v1/auth/user-auth');
        expect(response.status).toBe(401);
      });

      it('should deny access to admin profile without authentication', async () => {
        const response = await request(app).get('/api/v1/auth/admin-auth');
        expect(response.status).toBe(401);
      });
    });

    // Category Management Endpoints
    describe('Category Management Endpoints', () => {
      it('should deny access to create category without authentication', async () => {
        const response = await request(app)
          .post('/api/v1/category/create-category')
          .send({ name: 'Test Category' });
        expect(response.status).toBe(401);
      });

      it('should deny access to update category without authentication', async () => {
        const response = await request(app)
          .put('/api/v1/category/update-category/someId')
          .send({ name: 'Updated Category' });
        expect(response.status).toBe(401);
      });

      it('should deny access to delete category without authentication', async () => {
        const response = await request(app)
          .delete('/api/v1/category/delete-category/someId');
        expect(response.status).toBe(401);
      });
    });

    // Product Management Endpoints
    describe('Product Management Endpoints', () => {
      it('should deny access to create product without authentication', async () => {
        const response = await request(app)
          .post('/api/v1/product/create-product')
          .send({
            name: 'Test Product',
            description: 'Test Description',
            price: 99.99,
            category: 'someCategory',
            quantity: 10
          });
        expect(response.status).toBe(401);
      });

      it('should deny access to update product without authentication', async () => {
        const response = await request(app)
          .put('/api/v1/product/update-product/someId')
          .send({
            name: 'Updated Product'
          });
        expect(response.status).toBe(401);
      });

      it('should deny access to delete product without authentication', async () => {
        const validButNonexistentId = '507f1f77bcf86cd799439012'
        const response = await request(app)
          .delete(`/api/v1/product/delete-product/${validButNonexistentId}`);
        expect(response.status).toBe(401);
      });
    });

    // Order Management Endpoints
    describe('Order Management Endpoints', () => {
      it('should deny access to get all orders without authentication', async () => {
        const response = await request(app)
          .get('/api/v1/order/all-orders');
        expect(response.status).toBe(401);
      });

      it('should deny access to get user orders without authentication', async () => {
        const response = await request(app)
          .get('/api/v1/order/orders');
        expect(response.status).toBe(401);
      });

      it('should deny access to update order status without authentication', async () => {
        const response = await request(app)
          .put('/api/v1/order/order-status/someId')
          .send({ status: 'Processed' });
        expect(response.status).toBe(401);
      });
    });

    // Payment Endpoints
    describe('Payment Endpoints', () => {
      it('should deny access to get braintree token without authentication', async () => {
        const response = await request(app)
          .get('/api/v1/payments/braintree/token');
        expect(response.status).toBe(401);
      });

      it('should deny access to process payment without authentication', async () => {
        const response = await request(app)
          .post('/api/v1/payments/braintree/payment')
          .send({
            nonce: 'test-nonce',
            cart: []
          });
        expect(response.status).toBe(401);
      });
    });
  });

  // Test public endpoints (these should be accessible without authentication)
  describe('Public Endpoints Access Tests', () => {
    it('should allow access to login endpoint', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });
      expect(response.status).not.toBe(401);
    });

    it('should allow access to register endpoint', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          phone: '1234567890',
          address: 'Test Address'
        });
      expect(response.status).not.toBe(401);
    });

    it('should allow access to get all categories', async () => {
      const response = await request(app)
        .get('/api/v1/category/get-category');
      expect(response.status).not.toBe(401);
    });

    it('should allow access to get all products', async () => {
      const response = await request(app)
        .get('/api/v1/product/get-product');
      expect(response.status).not.toBe(401);
    });
  });
});