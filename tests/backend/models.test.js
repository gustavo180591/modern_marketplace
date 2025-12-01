import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import User from '../../backend/src/models/User.js';
import Product from '../../backend/src/models/Product.js';
import Order from '../../backend/src/models/Order.js';
import { query } from '../../backend/src/config/database.js';

// Mock database
jest.mock('../../backend/src/config/database.js');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const mockUser = {
        id: 'user-123',
        name: userData.name,
        email: userData.email,
        role: userData.role,
        created_at: new Date()
      };

      query.mockResolvedValue({
        rows: [mockUser]
      });

      const result = await User.create(userData);

      expect(result).toEqual(mockUser);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([userData.name, userData.email, expect.any(String), userData.role, undefined])
      );
    });

    test('should throw error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      const error = new Error('duplicate key value violates unique constraint');
      error.code = '23505';

      query.mockRejectedValue(error);

      await expect(User.create(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('findByEmail', () => {
    test('should find user by email', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: email,
        role: 'user'
      };

      query.mockResolvedValue({
        rows: [mockUser]
      });

      const result = await User.findByEmail(email);

      expect(result).toEqual(mockUser);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [email]
      );
    });

    test('should return null for non-existent email', async () => {
      query.mockResolvedValue({
        rows: []
      });

      const result = await User.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});

describe('Product Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('should create a new product successfully', async () => {
      const productData = {
        seller_id: 'seller-123',
        title: 'Test Product',
        description: 'A great product',
        price: 29.99,
        stock: 100,
        category: 'electronics'
      };

      const mockProduct = {
        id: 'product-123',
        ...productData,
        status: 'active',
        created_at: new Date()
      };

      query.mockResolvedValue({
        rows: [mockProduct]
      });

      const result = await Product.create(productData);

      expect(result).toEqual(mockProduct);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.arrayContaining([
          productData.seller_id,
          productData.title,
          productData.description,
          productData.price,
          productData.stock,
          productData.category,
          expect.any(String),
          expect.any(Array),
          'active'
        ])
      );
    });
  });

  describe('search', () => {
    test('should search products with filters', async () => {
      const filters = {
        category: 'electronics',
        min_price: 10,
        max_price: 100,
        search: 'phone',
        limit: 20,
        offset: 0
      };

      const mockProducts = [
        {
          id: 'product-1',
          title: 'Smart Phone',
          price: 99.99,
          category: 'electronics'
        }
      ];

      query.mockResolvedValue({
        rows: mockProducts
      });

      const result = await Product.search(filters);

      expect(result).toEqual(mockProducts);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining([
          filters.category,
          filters.min_price,
          filters.max_price,
          expect.stringContaining(filters.search),
          filters.limit,
          filters.offset
        ])
      );
    });
  });
});

describe('Order Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('should create a new order successfully', async () => {
      const orderData = {
        buyer_id: 'buyer-123',
        items: [
          { product_id: 'product-1', quantity: 2 }
        ],
        shipping_address: {
          street: '123 Test St',
          city: 'Test City'
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

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        await callback(mockClient);
      });

      // Override the transaction function for this test
      const originalTransaction = require('../../backend/src/config/database.js').transaction;
      require('../../backend/src/config/database.js').transaction = mockTransaction;

      const result = await Order.create(orderData);

      expect(result).toEqual(mockOrder);

      // Restore original transaction
      require('../../backend/src/config/database.js').transaction = originalTransaction;
    });
  });

  describe('findById', () => {
    test('should find order by ID', async () => {
      const orderId = 'order-123';
      const mockOrder = {
        id: orderId,
        buyer_id: 'buyer-123',
        total_amount: 199.98,
        status: 'pending',
        items: []
      };

      query.mockResolvedValue({
        rows: [mockOrder]
      });

      const result = await Order.findById(orderId);

      expect(result).toEqual(mockOrder);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [orderId]
      );
    });
  });
});
