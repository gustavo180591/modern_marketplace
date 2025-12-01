import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) {
      clearError();
    }
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      if (result.success) {
        navigate('/profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-lg)',
      background: 'linear-gradient(135deg, var(--color-surface), var(--color-background))'
    }}>
      <div className="card" style={{
        maxWidth: '450px',
        width: '100%',
        padding: 'var(--spacing-2xl)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)', color: 'var(--color-primary)' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Join our marketplace today
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--color-error)',
            color: 'white',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
              required
              disabled={isLoading}
            />
            {validationErrors.name && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>
                {validationErrors.name}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your phone number"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Create a password (min. 8 characters)"
              required
              disabled={isLoading}
            />
            {validationErrors.password && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Confirm your password"
              required
              disabled={isLoading}
            />
            {validationErrors.confirmPassword && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
                <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: 'var(--spacing-lg)',
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--color-border)'
        }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Already have an account?
          </p>
          <Link to="/login" className="btn btn-outline">
            Sign In
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            By creating an account, you agree to our{' '}
            <Link to="/terms" style={{ color: 'var(--color-primary)' }}>Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" style={{ color: 'var(--color-primary)' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
