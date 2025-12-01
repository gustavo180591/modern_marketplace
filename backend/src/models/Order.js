import { query, transaction } from '../config/database.js';
import Product from './Product.js';

export default class Order {
  // Create new order
  static async create(orderData) {
    const {
      buyer_id,
      items = [], // Array of {product_id, quantity}
      shipping_address,
      billing_address = null,
      notes = null
    } = orderData;

    return await transaction(async (client) => {
      // Calculate total amount and validate stock
      let totalAmount = 0;
      const productDetails = [];

      for (const item of items) {
        // Get product details and check stock
        const productResult = await client.query(
          'SELECT id, title, price, stock, seller_id FROM products WHERE id = $1 AND status = $2',
          [item.product_id, 'active']
        );

        if (!productResult.rows[0]) {
          throw new Error(`Product ${item.product_id} not found or not available`);
        }

        const product = productResult.rows[0];
        
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }

        const itemTotal = parseFloat(product.price) * item.quantity;
        totalAmount += itemTotal;

        productDetails.push({
          product_id: product.id,
          title: product.title,
          price: product.price,
          quantity: item.quantity,
          seller_id: product.seller_id,
          item_total: itemTotal
        });
      }

      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (buyer_id, total_amount, shipping_address, billing_address, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [buyer_id, totalAmount, JSON.stringify(shipping_address), 
          billing_address ? JSON.stringify(billing_address) : null, notes]);

      const order = orderResult.rows[0];

      // Create order items and update stock
      for (const item of productDetails) {
        // Create order item with product snapshot
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price, product_snapshot)
          VALUES ($1, $2, $3, $4, $5)
        `, [order.id, item.product_id, item.quantity, item.price, JSON.stringify({
          title: item.title,
          seller_id: item.seller_id
        })]);

        // Update product stock
        await client.query(`
          UPDATE products 
          SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [item.quantity, item.product_id]);
      }

      return order;
    });
  }

  // Find order by ID
  static async findById(id, userId = null) {
    let sql = `
      SELECT o.*, 
             u.name as buyer_name, u.email as buyer_email,
             (SELECT JSON_AGG(
               JSON_BUILD_OBJECT(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'product_snapshot', oi.product_snapshot,
                 'created_at', oi.created_at
               )
             )) as items
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
    `;
    
    const values = [id];
    
    if (userId) {
      sql += ' AND o.buyer_id = $2';
      values.push(userId);
    }

    sql += ' GROUP BY o.id, u.id';

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  // Get orders by buyer
  static async findByBuyer(buyerId, filters = {}) {
    let sql = `
      SELECT o.*, 
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      WHERE o.buyer_id = $1
    `;
    const values = [buyerId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND o.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.start_date) {
      sql += ` AND o.created_at >= $${paramCount}`;
      values.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      sql += ` AND o.created_at <= $${paramCount}`;
      values.push(filters.end_date);
      paramCount++;
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    
    sql += ` ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }

  // Get orders by seller (products they sold)
  static async findBySeller(sellerId, filters = {}) {
    let sql = `
      SELECT DISTINCT o.*, 
             u.name as buyer_name, u.email as buyer_email,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = $1
    `;
    const values = [sellerId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND o.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.start_date) {
      sql += ` AND o.created_at >= $${paramCount}`;
      values.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      sql += ` AND o.created_at <= $${paramCount}`;
      values.push(filters.end_date);
      paramCount++;
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    
    sql += ` ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }

  // Update order status
  static async updateStatus(id, status, userId = null, trackingNumber = null) {
    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }

    let sql = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    const values = [status];
    let paramCount = 2;

    if (trackingNumber) {
      sql += `, tracking_number = $${paramCount}`;
      values.push(trackingNumber);
      paramCount++;
    }

    sql += ` WHERE id = $${paramCount}`;
    values.push(id);
    paramCount++;

    if (userId) {
      sql += ` AND buyer_id = $${paramCount}`;
      values.push(userId);
    }

    sql += ` RETURNING *`;

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  // Cancel order and restore stock
  static async cancel(id, userId = null) {
    return await transaction(async (client) => {
      // Get order details
      const orderResult = await client.query(`
        SELECT * FROM orders WHERE id = $1 ${userId ? 'AND buyer_id = $2' : ''}
      `, userId ? [id, userId] : [id]);

      if (!orderResult.rows[0]) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];

      if (order.status !== 'pending' && order.status !== 'confirmed') {
        throw new Error('Order cannot be cancelled in current status');
      }

      // Get order items to restore stock
      const itemsResult = await client.query(`
        SELECT product_id, quantity FROM order_items WHERE order_id = $1
      `, [id]);

      // Restore stock for each item
      for (const item of itemsResult.rows) {
        await client.query(`
          UPDATE products 
          SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [item.quantity, item.product_id]);
      }

      // Update order status
      await client.query(`
        UPDATE orders 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);

      return { message: 'Order cancelled and stock restored' };
    });
  }

  // Get order statistics
  static async getStats(userId = null, role = 'buyer') {
    let sql = '';
    const values = [];

    if (role === 'buyer') {
      sql = `
        SELECT 
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
          COUNT(*) FILTER (WHERE status = 'shipped') as shipped_orders,
          COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
          COALESCE(SUM(total_amount), 0) as total_spent,
          COALESCE(AVG(total_amount), 0) as avg_order_value
        FROM orders 
        WHERE buyer_id = $1
      `;
      values.push(userId);
    } else if (role === 'seller') {
      sql = `
        SELECT 
          COUNT(DISTINCT o.id) as total_orders,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending') as pending_orders,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'confirmed') as confirmed_orders,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'shipped') as shipped_orders,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'delivered') as delivered_orders,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'cancelled') as cancelled_orders,
          COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
          COALESCE(AVG(o.total_amount), 0) as avg_order_value
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.seller_id = $1
      `;
      values.push(userId);
    }

    const result = await query(sql, values);
    return result.rows[0] || {};
  }

  // Get recent orders
  static async getRecent(userId = null, role = 'buyer', limit = 5) {
    let sql = '';
    const values = [limit];

    if (role === 'buyer') {
      sql = `
        SELECT o.id, o.total_amount, o.status, o.created_at,
               (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
        FROM orders o
        WHERE o.buyer_id = $2
        ORDER BY o.created_at DESC
        LIMIT $1
      `;
      values.push(userId);
    } else if (role === 'seller') {
      sql = `
        SELECT DISTINCT o.id, o.total_amount, o.status, o.created_at,
               u.name as buyer_name,
               (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
        FROM orders o
        JOIN users u ON o.buyer_id = u.id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.seller_id = $2
        ORDER BY o.created_at DESC
        LIMIT $1
      `;
      values.push(userId);
    }

    const result = await query(sql, values);
    return result.rows;
  }
}
