import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Featured products
app.get('/api/products/featured', (req, res) => {
  res.json({
    message: 'Featured products retrieved',
    data: {
      products: [
        {
          id: '1',
          title: 'Premium Laptop',
          description: 'High-performance laptop for professionals',
          price: 1299.99,
          images: [],
          category: 'electronics',
          rating: 4.5,
          stock: 15
        },
        {
          id: '2',
          title: 'Wireless Headphones',
          description: 'Noise-cancelling wireless headphones',
          price: 199.99,
          images: [],
          category: 'electronics',
          rating: 4.8,
          stock: 30
        },
        {
          id: '3',
          title: 'Smart Watch',
          description: 'Fitness and health tracking smartwatch',
          price: 299.99,
          images: [],
          category: 'electronics',
          rating: 4.2,
          stock: 25
        },
        {
          id: '4',
          title: 'Camera Lens',
          description: 'Professional camera lens kit',
          price: 899.99,
          images: [],
          category: 'photography',
          rating: 4.7,
          stock: 10
        }
      ]
    }
  });
});

// Categories
app.get('/api/products/categories', (req, res) => {
  res.json({
    message: 'Categories retrieved',
    data: ['electronics', 'clothing', 'books', 'home', 'sports']
  });
});

// Products
app.get('/api/products', (req, res) => {
  res.json({
    message: 'Products retrieved',
    data: {
      products: [],
      pagination: { page: 1, limit: 10, total: 0 }
    }
  });
});

// Users
app.get('/api/users', (req, res) => {
  res.json({ message: 'Users endpoint', data: [] });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📦 Featured Products: http://localhost:${PORT}/api/products/featured`);
});
