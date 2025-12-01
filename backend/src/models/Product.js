import { query, transaction } from '../config/database.js';

export default class Product {
  // Create new product
  static async create(productData) {
    const {
      seller_id,
      title,
      description,
      price,
      stock,
      category,
      images = [],
      tags = [],
      status = 'active'
    } = productData;

    const sql = `
      INSERT INTO products (seller_id, title, description, price, stock, category, images, tags, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    try {
      const result = await query(sql, [
        seller_id, title, description, price, stock, 
        category, JSON.stringify(images), tags, status
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  // Find product by ID
  static async findById(id) {
    const sql = `
      SELECT p.*, u.name as seller_name, u.email as seller_email
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = $1 AND p.status IN ('active', 'inactive')
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Get products by seller
  static async findBySeller(sellerId, filters = {}) {
    let sql = `
      SELECT p.*, 
             (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count,
             (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.product_id = p.id) as avg_rating
      FROM products p
      WHERE p.seller_id = $1
    `;
    const values = [sellerId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND p.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.category) {
      sql += ` AND p.category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    
    sql += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }

  // Search products
  static async search(filters = {}) {
    let sql = `
      SELECT p.*, 
             u.name as seller_name,
             (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count,
             (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.product_id = p.id) as avg_rating
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
    `;
    const values = [];
    let paramCount = 1;

    if (filters.category) {
      sql += ` AND p.category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    if (filters.min_price) {
      sql += ` AND p.price >= $${paramCount}`;
      values.push(filters.min_price);
      paramCount++;
    }

    if (filters.max_price) {
      sql += ` AND p.price <= $${paramCount}`;
      values.push(filters.max_price);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.tags && filters.tags.length > 0) {
      sql += ` AND p.tags && $${paramCount}`;
      values.push(filters.tags);
      paramCount++;
    }

    // Sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'DESC';
    sql += ` ORDER BY p.${sortBy} ${sortOrder}`;

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    
    sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }

  // Update product
  static async update(id, updateData) {
    const allowedFields = ['title', 'description', 'price', 'stock', 'category', 'images', 'tags', 'status'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'images' || key === 'tags') {
          updates.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    
    const sql = `
      UPDATE products 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  // Delete product (soft delete - set status to inactive)
  static async delete(id) {
    const sql = `
      UPDATE products 
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, status, updated_at
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Update stock (for order processing)
  static async updateStock(id, quantity, operation = 'decrease') {
    const operator = operation === 'increase' ? '+' : '-';
    
    const sql = `
      UPDATE products 
      SET stock = stock ${operator} $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND stock >= $1
      RETURNING id, stock, updated_at
    `;

    const result = await query(sql, [Math.abs(quantity), id]);
    return result.rows[0] || null;
  }

  // Increment view count
  static async incrementViews(id) {
    const sql = `
      UPDATE products 
      SET views = views + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, views, updated_at
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Update rating (when review is added/updated)
  static async updateRating(id) {
    const sql = `
      UPDATE products 
      SET rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM reviews 
        WHERE product_id = $1
      ), updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, rating, updated_at
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Get product statistics
  static async getStats(sellerId) {
    const sql = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE status = 'active') as active_products,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_products,
        COUNT(*) FILTER (WHERE status = 'sold') as sold_products,
        COALESCE(SUM(stock), 0) as total_stock,
        COALESCE(AVG(price), 0) as avg_price,
        COALESCE(AVG(rating), 0) as avg_rating,
        SUM(views) as total_views
      FROM products 
      WHERE seller_id = $1
    `;

    const result = await query(sql, [sellerId]);
    return result.rows[0] || {};
  }

  // Get categories
  static async getCategories() {
    const sql = `
      SELECT category, COUNT(*) as product_count
      FROM products 
      WHERE status = 'active' AND category IS NOT NULL
      GROUP BY category
      ORDER BY product_count DESC
    `;

    const result = await query(sql);
    return result.rows;
  }

  // Get featured products
  static async getFeatured(limit = 10) {
    const sql = `
      SELECT p.*, 
             u.name as seller_name,
             (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count,
             (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.product_id = p.id) as avg_rating
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active' AND p.rating >= 4.0
      ORDER BY p.rating DESC, p.views DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }
}
