import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../backend/src/app.js';
import { query, transaction } from '../../backend/src/config/database.js';

// Mock database for integration tests
jest.mock('../../backend/src/config/database.js');

describe('API Integration Tests', () => {
  let server;
  let mockDb;

  beforeAll(async () => {
    // Start test server
    server = app.listen(0); // Use random port
    
    // Setup mock database
    mockDb = {
      users: [],
      products: [],
      orders: [],
      sessions: []
    };
  });

  afterAll(async () => {
    // Close test server
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  beforeEach(() => {
    // Reset mocks and data
    jest.clearAllMocks();
    mockDb = {
      users: [],
      products: [],
      orders: [],
      sessions: []
    };
  });

  describe('User Registration and Login Flow', () => {
    test('should complete full user registration and login cycle', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integration@example.com',
        password: 'password123'
      };

      // Mock database responses
      query
        .mockResolvedValueOnce({
          rows: [{
            id: 'user-123',
            name: userData.name,
            email: userData.email,
            role: 'user',
            created_at: new Date()
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'user-123',
            name: userData.name,
            email: userData.email,
            password_hash: '$2b$12$hashedpassword',
            role: 'user'
          }]
        });

      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.message).toBe('User registered successfully');
      expect(registerResponse.body.data.user.email).toBe(userData.email);
      expect(registerResponse.body.data.tokens).toBeDefined();

      const { accessToken, refreshToken } = registerResponse.body.data.tokens;

      // Step 2: Login with credentials
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.message).toBe('Login successful');
      expect(loginResponse.body.data.user.email).toBe(userData.email);
      expect(loginResponse.body.data.tokens).toBeDefined();

      // Step 3: Access protected route with token
      const profileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.message).toBe('Profile retrieved successfully');
      expect(profileResponse.body.data.user.email).toBe(userData.email);

      // Step 4: Logout
      const logoutResponse = await request(app)
        .post('/api/users/logout')
        .send({ refreshToken })
        .expect(200);

      expect(logoutResponse.body.message).toBe('Logout successful');
    });

    test('should handle invalid token access', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    test('should handle missing token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('Product Management Flow', () => {
    test('should complete product creation and retrieval cycle', async () => {
      // Mock authentication
      const mockUser = {
        id: 'seller-123',
        email: 'seller@example.com',
        role: 'seller'
      };

      // Mock product data
      const productData = {
        title: 'Integration Test Product',
        description: 'A product for integration testing',
        price: 99.99,
        stock: 50,
        category: 'electronics'
      };

      const mockProduct = {
        id: 'product-123',
        seller_id: mockUser.id,
        ...productData,
        status: 'active',
        created_at: new Date()
      };

      // Mock database responses
      query
        .mockResolvedValueOnce({
          rows: [mockProduct]
        })
        .mockResolvedValueOnce({
          rows: [mockProduct]
        });

      // Create product
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer valid-seller-token')
        .send(productData)
        .expect(201);

      expect(createResponse.body.message).toBe('Product created successfully');
      expect(createResponse.body.data.product.title).toBe(productData.title);

      // Get product by ID
      const getResponse = await request(app)
        .get(`/api/products/${mockProduct.id}`)
        .expect(200);

      expect(getResponse.body.message).toBe('Product retrieved successfully');
      expect(getResponse.body.data.product.title).toBe(productData.title);
    });
  });

  describe('Order Management Flow', () => {
    test('should complete order creation and status update cycle', async () => {
      // Mock order data
      const orderData = {
        buyer_id: 'buyer-123',
        items: [
          { product_id: 'product-1', quantity: 2 }
        ],
        shipping_address: {
          street: '123 Test St',
          city: 'Test City',
          country: 'Test Country'
        }
      };

      const mockOrder = {
        id: 'order-123',
        buyer_id: orderData.buyer_id,
        total_amount: 199.98,
        status: 'pending',
        created_at: new Date()
      };

      // Mock transaction
      const mockClient = {
        query: jest.fn()
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: 'product-1', title: 'Test Product', price: 99.99, stock: 10, seller_id: 'seller-1' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      transaction.mockImplementation(async (callback) => {
        await callback(mockClient);
      });

      // Create order
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-buyer-token')
        .send(orderData)
        .expect(201);

      expect(createResponse.body.message).toBe('Order created successfully');
      expect(createResponse.body.data.order.status).toBe('pending');

      // Update order status
      const updateResponse = await request(app)
        .put(`/api/orders/${mockOrder.id}/status`)
        .set('Authorization', 'Bearer valid-seller-token')
        .send({ status: 'confirmed' })
        .expect(200);

      expect(updateResponse.body.message).toBe('Order status updated successfully');
      expect(updateResponse.body.data.order.status).toBe('confirmed');
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // Mock database error
      query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(500);

      expect(response.body.error).toBe('Registration failed');
      expect(response.body.message).toBe('Internal server error');
    });

    test('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body.error).toBe('Validation error');
    });

    test('should handle not found errors', async () => {
      query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/users/nonexistent-user')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to auth endpoints', async () => {
      // Mock successful responses
      query.mockResolvedValue({
        rows: [{
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        }]
      });

      // Make multiple requests quickly
      const requests = Array(10).fill().map(() =>
        request(app)
          .post('/api/users/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
      );

      const responses = await Promise.all(requests);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.environment).toBeDefined();
    });
  });
});
