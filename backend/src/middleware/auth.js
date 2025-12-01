import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// JWT token generation
export const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

// Store refresh token in database
export const storeRefreshToken = async (userId, refreshToken) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const sql = `
    INSERT INTO sessions (user_id, refresh_token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, expires_at
  `;

  try {
    const result = await query(sql, [userId, refreshToken, expiresAt]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      // Update existing token
      const updateSql = `
        UPDATE sessions 
        SET refresh_token = $1, expires_at = $2, is_active = true
        WHERE user_id = $3 AND is_active = true
        RETURNING id, expires_at
      `;
      const updateResult = await query(updateSql, [refreshToken, expiresAt, userId]);
      return updateResult.rows[0];
    }
    throw error;
  }
};

// Verify refresh token and get user
export const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if refresh token exists and is active
    const tokenResult = await query(`
      SELECT s.*, u.id, u.email, u.role, u.name
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.refresh_token = $1 AND s.is_active = true AND s.expires_at > CURRENT_TIMESTAMP
    `, [refreshToken]);

    if (!tokenResult.rows[0]) {
      throw new Error('Invalid or expired refresh token');
    }

    return tokenResult.rows[0];
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Revoke refresh token
export const revokeRefreshToken = async (refreshToken) => {
  const sql = `
    UPDATE sessions 
    SET is_active = false
    WHERE refresh_token = $1
    RETURNING id
  `;

  const result = await query(sql, [refreshToken]);
  return result.rows[0] || null;
};

// Revoke all user tokens (logout from all devices)
export const revokeAllUserTokens = async (userId) => {
  const sql = `
    UPDATE sessions 
    SET is_active = false
    WHERE user_id = $1 AND is_active = true
    RETURNING id
  `;

  const result = await query(sql, [userId]);
  return result.rows;
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid access token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const userResult = await query(`
      SELECT id, email, role, name, is_active, email_verified
      FROM users 
      WHERE id = $1 AND is_active = true
    `, [decoded.id]);

    if (!userResult.rows[0]) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found or inactive'
      });
    }

    const user = userResult.rows[0];
    
    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      emailVerified: user.email_verified
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please refresh your access token'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please provide a valid access token'
      });
    } else {
      console.error('Authentication error:', error);
      return res.status(500).json({
        error: 'Authentication error',
        message: 'Internal server error'
      });
    }
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please login to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userResult = await query(`
      SELECT id, email, role, name, is_active, email_verified
      FROM users 
      WHERE id = $1 AND is_active = true
    `, [decoded.id]);

    if (userResult.rows[0]) {
      req.user = {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        role: userResult.rows[0].role,
        name: userResult.rows[0].name,
        emailVerified: userResult.rows[0].email_verified
      };
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

// Email verification required middleware
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login to access this resource'
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      error: 'Email verification required',
      message: 'Please verify your email address to access this feature'
    });
  }

  next();
};

// Resource ownership verification middleware
export const verifyOwnership = (resourceType, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;
      const userRole = req.user.role;

      // Admin can access any resource
      if (userRole === 'admin') {
        return next();
      }

      let sql = '';
      let ownerField = '';

      switch (resourceType) {
        case 'product':
          sql = 'SELECT seller_id FROM products WHERE id = $1';
          ownerField = 'seller_id';
          break;
        case 'order':
          sql = 'SELECT buyer_id FROM orders WHERE id = $1';
          ownerField = 'buyer_id';
          break;
        case 'review':
          sql = 'SELECT user_id FROM reviews WHERE id = $1';
          ownerField = 'user_id';
          break;
        default:
          return res.status(400).json({
            error: 'Invalid resource type',
            message: 'Resource type must be product, order, or review'
          });
      }

      const result = await query(sql, [resourceId]);

      if (!result.rows[0]) {
        return res.status(404).json({
          error: 'Resource not found',
          message: `${resourceType} not found`
        });
      }

      const ownerId = result.rows[0][ownerField];

      if (ownerId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only access your own resources'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership verification error:', error);
      return res.status(500).json({
        error: 'Verification error',
        message: 'Internal server error'
      });
    }
  };
};

// Rate limiting for authentication endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
};
