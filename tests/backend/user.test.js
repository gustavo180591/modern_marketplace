import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../backend/src/app.js';
import { query } from '../../backend/src/config/database.js';

// Mock database
jest.mock('../../backend/src/config/database.js');

describe('User API', () => {
  let server;
  
  beforeAll(async () => {
    // Start test server
    server = app.listen(0); // Use random port
  });
  
  afterAll(async () => {
    // Close test server
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    test('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        created_at: new Date().toISOString()
      };

      query.mockResolvedValue({
        rows: [mockUser]
      });

      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.tokens).toBeDefined();
    });

    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation error');
      expect(response.body.message).toContain('required');
    });

    test('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation error');
      expect(response.body.message).toContain('Invalid email format');
    });

    test('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation error');
      expect(response.body.message).toContain('8 characters');
    });
  });

  describe('POST /api/users/login', () => {
    test('should login user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password_hash: '$2b$12$hashedpassword',
        role: 'user'
      };

      query.mockResolvedValue({
        rows: [mockUser]
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.tokens).toBeDefined();
    });

    test('should return 401 for invalid credentials', async () => {
      query.mockResolvedValue({
        rows: []
      });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Authentication failed');
    });
  });

  describe('GET /api/users/profile', () => {
    test('should return user profile for authenticated user', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      query.mockResolvedValue({
        rows: [mockUser]
      });

      // Mock authentication middleware
      jest.doMock('../../backend/src/middleware/auth.js', () => ({
        authenticate: (req, res, next) => {
          req.user = { id: 'user-123', email: 'test@example.com', role: 'user' };
          next();
        }
      }));

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.message).toBe('Profile retrieved successfully');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    test('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });
  });
});
