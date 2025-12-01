import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  verifyEmail,
  deactivateAccount,
  getStats,
  getAllUsers,
  getUserById
} from '../controllers/userController.js';
import { authenticate, authorize, authRateLimit } from '../middleware/auth.js';

const router = express.Router();

// Authentication rate limiting
const authLimiter = rateLimit({
  windowMs: authRateLimit.windowMs,
  max: authRateLimit.max,
  message: authRateLimit.message,
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting for user routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all user routes
router.use(generalLimiter);

// Public routes (no authentication required)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh-token', authLimiter, refreshToken);

// Protected routes (authentication required)
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/verify-email', authenticate, verifyEmail);
router.delete('/deactivate', authenticate, deactivateAccount);
router.get('/stats', authenticate, getStats);

// Admin routes (admin role required)
router.get('/admin/all', authenticate, authorize('admin'), getAllUsers);
router.get('/admin/:id', authenticate, authorize('admin'), getUserById);

export default router;
