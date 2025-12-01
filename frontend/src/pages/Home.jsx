import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Home = () => {
  const { featuredProducts, loading, fetchFeaturedProducts } = useProducts();
  const { isDark } = useTheme();

  React.useEffect(() => {
    fetchFeaturedProducts();
  }, []); // Empty dependency array to run only once

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: 'var(--spacing-2xl) 0',
        background: `linear-gradient(135deg, ${isDark ? '#1e293b' : '#f8fafc'}, ${isDark ? '#0f172a' : '#ffffff'})`,
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--spacing-2xl)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: 'var(--spacing-lg)', color: 'var(--color-primary)' }}>
          Welcome to Modern Marketplace
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
          Discover amazing products from trusted sellers
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
          <Link to="/products" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: 'var(--spacing-md) var(--spacing-xl)' }}>
            Browse Products
          </Link>
          <Link to="/register" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: 'var(--spacing-md) var(--spacing-xl)' }}>
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', fontSize: '2rem' }}>
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-3">
          <div className="card">
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🛡️</div>
            <h3>Secure Transactions</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Safe and secure payment processing with buyer protection
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🚀</div>
            <h3>Fast Delivery</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Quick and reliable shipping from verified sellers
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>⭐</div>
            <h3>Quality Products</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Curated selection of high-quality products
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', fontSize: '2rem' }}>
          Featured Products
        </h2>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading featured products...</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-4">
            {featuredProducts.map(product => (
              <div key={product.id} className="card">
                <div style={{
                  height: '200px',
                  backgroundColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}>
                  📦
                </div>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>{product.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                  {product.description?.substring(0, 100)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    ${product.price}
                  </span>
                  <Link to={`/products/${product.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center">
            <h3>No featured products available</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Check back later for amazing deals!
            </p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section style={{
        textAlign: 'center',
        padding: 'var(--spacing-2xl)',
        background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
        borderRadius: 'var(--radius-lg)',
        marginTop: 'var(--spacing-2xl)',
        color: 'white'
      }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Ready to Start Shopping?</h2>
        <p style={{ marginBottom: 'var(--spacing-xl)', opacity: 0.9 }}>
          Join thousands of satisfied customers today
        </p>
        <Link to="/register" className="btn" style={{
          backgroundColor: 'white',
          color: 'var(--color-primary)',
          fontSize: '1.1rem',
          padding: 'var(--spacing-md) var(--spacing-xl)'
        }}>
          Create Account
        </Link>
      </section>
    </div>
  );
};

export default Home;
