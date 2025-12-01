import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

export default class User {
  // Create new user
  static async create(userData) {
    const { name, email, password, role = 'user', phone } = userData;
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const sql = `
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, phone, is_active, email_verified, created_at
    `;
    
    try {
      const result = await query(sql, [name, email, passwordHash, role, phone]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = `
      SELECT id, name, email, password_hash, role, phone, avatar_url, 
             is_active, email_verified, created_at, updated_at
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const sql = `
      SELECT id, name, email, role, phone, avatar_url, 
             is_active, email_verified, created_at, updated_at
      FROM users 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Verify password
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  // Update user profile
  static async updateProfile(id, updateData) {
    const allowedFields = ['name', 'phone', 'avatar_url'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    
    const sql = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND is_active = true
      RETURNING id, name, email, role, phone, avatar_url, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  // Change password
  static async changePassword(id, currentPassword, newPassword) {
    // First verify current password
    const user = await query(
      'SELECT password_hash FROM users WHERE id = $1 AND is_active = true',
      [id]
    );

    if (!user.rows[0]) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    const sql = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
      RETURNING id, updated_at
    `;

    const result = await query(sql, [newPasswordHash, id]);
    return result.rows[0] || null;
  }

  // Deactivate user (soft delete)
  static async deactivate(id) {
    const sql = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, is_active, updated_at
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Get user statistics
  static async getStats(id) {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM products WHERE seller_id = $1 AND status = 'active') as active_products,
        (SELECT COUNT(*) FROM orders WHERE buyer_id = $1) as total_orders,
        (SELECT COUNT(*) FROM reviews WHERE user_id = $1) as reviews_count,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE user_id = $1) as avg_rating
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || {};
  }

  // Search users (for admin)
  static async search(filters = {}) {
    let sql = `
      SELECT id, name, email, role, phone, avatar_url, is_active, 
             email_verified, created_at, updated_at
      FROM users 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.role) {
      sql += ` AND role = $${paramCount}`;
      values.push(filters.role);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }

  // Verify email
  static async verifyEmail(id) {
    const sql = `
      UPDATE users 
      SET email_verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email_verified, updated_at
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }
}
