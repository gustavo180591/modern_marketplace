import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      padding: 'var(--spacing-lg)',
      textAlign: 'center',
      marginTop: 'auto'
    }}>
      <div className="grid grid-cols-3" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <h4>Modern Marketplace</h4>
          <p>Your trusted online marketplace</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <a href="/products" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Products</a>
            <a href="/about" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>About</a>
            <a href="/contact" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
        <div>
          <h4>Connect</h4>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
            <span>📧</span>
            <span>🐦</span>
            <span>📘</span>
            <span>📷</span>
          </div>
        </div>
      </div>
      
      <div style={{
        borderTop: '1px solid var(--color-border)',
        marginTop: 'var(--spacing-lg)',
        paddingTop: 'var(--spacing-md)',
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
      }}>
        <p>&copy; {currentYear} Modern Marketplace. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
