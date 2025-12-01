// Database mock utilities for testing
export class MockDatabase {
  constructor() {
    this.data = {
      users: [],
      products: [],
      orders: [],
      sessions: [],
      order_items: [],
      payments: [],
      reviews: [],
      shopping_cart: []
    };
    this.nextId = 1;
  }

  // Generate unique ID
  generateId() {
    return `${this.nextId++}`;
  }

  // Find records by criteria
  find(table, criteria = {}) {
    let records = this.data[table] || [];

    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined) {
        records = records.filter(record => record[key] === value);
      }
    });

    return records;
  }

  // Find single record by criteria
  findOne(table, criteria = {}) {
    const records = this.find(table, criteria);
    return records.length > 0 ? records[0] : null;
  }

  // Insert record
  insert(table, data) {
    const record = {
      id: this.generateId(),
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (!this.data[table]) {
      this.data[table] = [];
    }

    this.data[table].push(record);
    return record;
  }

  // Update record
  update(table, id, data) {
    const recordIndex = this.data[table]?.findIndex(record => record.id === id);
    
    if (recordIndex === -1 || recordIndex === undefined) {
      return null;
    }

    this.data[table][recordIndex] = {
      ...this.data[table][recordIndex],
      ...data,
      updated_at: new Date()
    };

    return this.data[table][recordIndex];
  }

  // Delete record
  delete(table, id) {
    const recordIndex = this.data[table]?.findIndex(record => record.id === id);
    
    if (recordIndex === -1 || recordIndex === undefined) {
      return null;
    }

    const deletedRecord = this.data[table].splice(recordIndex, 1)[0];
    return deletedRecord;
  }

  // Clear all data
  clear() {
    Object.keys(this.data).forEach(table => {
      this.data[table] = [];
    });
    this.nextId = 1;
  }

  // Get table data
  getTable(table) {
    return this.data[table] || [];
  }

  // Query simulation
  async query(sql, params = []) {
    // Simple query simulation for basic CRUD operations
    if (sql.includes('INSERT INTO')) {
      const tableName = sql.match(/INSERT INTO (\w+)/)?.[1];
      if (tableName) {
        const record = this.insert(tableName.toLowerCase(), {});
        return { rows: [record] };
      }
    } else if (sql.includes('SELECT')) {
      const tableName = sql.match(/FROM (\w+)/)?.[1];
      if (tableName) {
        const records = this.find(tableName.toLowerCase(), {});
        return { rows: records };
      }
    } else if (sql.includes('UPDATE')) {
      const tableName = sql.match(/UPDATE (\w+)/)?.[1];
      if (tableName) {
        const record = this.update(tableName.toLowerCase(), params[params.length - 1], {});
        return { rows: record ? [record] : [] };
      }
    } else if (sql.includes('DELETE')) {
      const tableName = sql.match(/DELETE FROM (\w+)/)?.[1];
      if (tableName) {
        const record = this.delete(tableName.toLowerCase(), params[params.length - 1]);
        return { rows: record ? [record] : [] };
      }
    }

    return { rows: [] };
  }

  // Transaction simulation
  async transaction(callback) {
    const mockClient = {
      query: this.query.bind(this)
    };

    return await callback(mockClient);
  }
}

// Create global mock database instance
export const mockDatabase = new MockDatabase();

// Mock the database module
export const mockQuery = jest.fn((sql, params) => mockDatabase.query(sql, params));
export const mockTransaction = jest.fn((callback) => mockDatabase.transaction(callback));

// Helper functions for creating test data
export const createTestUser = (overrides = {}) => {
  return mockDatabase.insert('users', {
    name: 'Test User',
    email: 'test@example.com',
    password_hash: '$2b$12$hashedpassword',
    role: 'user',
    is_active: true,
    email_verified: false,
    phone: null,
    avatar_url: null,
    ...overrides
  });
};

export const createTestProduct = (overrides = {}) => {
  return mockDatabase.insert('products', {
    seller_id: 'seller-123',
    title: 'Test Product',
    description: 'A test product',
    price: 29.99,
    stock: 100,
    category: 'electronics',
    images: [],
    tags: [],
    status: 'active',
    rating: 0,
    views: 0,
    ...overrides
  });
};

export const createTestOrder = (overrides = {}) => {
  const order = mockDatabase.insert('orders', {
    buyer_id: 'buyer-123',
    total_amount: 99.99,
    status: 'pending',
    shipping_address: {
      street: '123 Test St',
      city: 'Test City'
    },
    billing_address: null,
    notes: null,
    tracking_number: null,
    ...overrides
  });

  // Create order items if provided
  if (overrides.items) {
    overrides.items.forEach(item => {
      mockDatabase.insert('order_items', {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product_snapshot: {
          title: 'Test Product',
          seller_id: 'seller-123'
        }
      });
    });
  }

  return order;
};

export const createTestSession = (overrides = {}) => {
  return mockDatabase.insert('sessions', {
    user_id: 'user-123',
    refresh_token: 'refresh-token-123',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    is_active: true,
    ...overrides
  });
};

// Reset function for tests
export const resetMockDatabase = () => {
  mockDatabase.clear();
};

// Export default mock database
export default mockDatabase;
