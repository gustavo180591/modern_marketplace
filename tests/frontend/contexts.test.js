import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../frontend/src/contexts/AuthContext.js';
import { ThemeProvider, useTheme } from '../../frontend/src/contexts/ThemeContext.js';
import { ProductProvider, useProducts } from '../../frontend/src/contexts/ProductContext.js';

// Mock API
jest.mock('../../frontend/src/utils/api.js', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const { api } = require('../../frontend/src/utils/api.js');

// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ProductProvider>
          {children}
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('useAuth hook', () => {
    test('should provide authentication methods', () => {
      const TestComponent = () => {
        const auth = useAuth();
        
        return (
          <div>
            <button onClick={() => auth.login({ email: 'test@example.com', password: 'password' })}>
              Login
            </button>
            <button onClick={() => auth.register({ name: 'Test', email: 'test@example.com', password: 'password' })}>
              Register
            </button>
            <button onClick={auth.logout}>
              Logout
            </button>
            <span data-testid="is-authenticated">{auth.isAuthenticated.toString()}</span>
            <span data-testid="user-email">{auth.user?.email || ''}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('');
    });

    test('should handle successful login', async () => {
      const mockResponse = {
        data: {
          data: {
            user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
            tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' }
          }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const TestComponent = () => {
        const { login, isAuthenticated, user } = useAuth();
        
        const handleLogin = async () => {
          await login({ email: 'test@example.com', password: 'password' });
        };

        return (
          <div>
            <button onClick={handleLogin}>Login</button>
            <span data-testid="is-authenticated">{isAuthenticated.toString()}</span>
            <span data-testid="user-email">{user?.email || ''}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });

      expect(api.post).toHaveBeenCalledWith('/users/login', {
        email: 'test@example.com',
        password: 'password'
      });
    });

    test('should handle login error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      };

      api.post.mockRejectedValue(mockError);

      const TestComponent = () => {
        const { login, error, isAuthenticated } = useAuth();
        
        const handleLogin = async () => {
          await login({ email: 'test@example.com', password: 'wrongpassword' });
        };

        return (
          <div>
            <button onClick={handleLogin}>Login</button>
            <span data-testid="is-authenticated">{isAuthenticated.toString()}</span>
            <span data-testid="error">{error || ''}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      });
    });

    test('should handle successful registration', async () => {
      const mockResponse = {
        data: {
          data: {
            user: { id: 'user-123', email: 'new@example.com', name: 'New User' },
            tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' }
          }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const TestComponent = () => {
        const { register, isAuthenticated, user } = useAuth();
        
        const handleRegister = async () => {
          await register({
            name: 'New User',
            email: 'new@example.com',
            password: 'password123'
          });
        };

        return (
          <div>
            <button onClick={handleRegister}>Register</button>
            <span data-testid="is-authenticated">{isAuthenticated.toString()}</span>
            <span data-testid="user-email">{user?.email || ''}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const registerButton = screen.getByText('Register');
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com');
      });

      expect(api.post).toHaveBeenCalledWith('/users/register', {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      });
    });

    test('should handle logout', async () => {
      // First login
      localStorage.setItem('accessToken', 'access-token');
      localStorage.setItem('refreshToken', 'refresh-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123', email: 'test@example.com' }));

      api.post.mockResolvedValue({});

      const TestComponent = () => {
        const { logout, isAuthenticated } = useAuth();
        
        const handleLogout = async () => {
          await logout();
        };

        return (
          <div>
            <button onClick={handleLogout}>Logout</button>
            <span data-testid="is-authenticated">{isAuthenticated.toString()}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Wait for initial auth state to load
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('useTheme hook', () => {
    test('should provide theme methods and state', () => {
      const TestComponent = () => {
        const { theme, toggleTheme, isDark, isLight } = useTheme();
        
        return (
          <div>
            <span data-testid="theme-mode">{theme.mode}</span>
            <span data-testid="is-dark">{isDark.toString()}</span>
            <span data-testid="is-light">{isLight.toString()}</span>
            <button onClick={toggleTheme}>Toggle Theme</button>
          </div>
        );
      };

      render(
        <BrowserRouter>
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
      expect(screen.getByTestId('is-light')).toHaveTextContent('true');
    });

    test('should toggle theme correctly', () => {
      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme();
        
        return (
          <div>
            <span data-testid="theme-mode">{theme.mode}</span>
            <button onClick={toggleTheme}>Toggle Theme</button>
          </div>
        );
      };

      render(
        <BrowserRouter>
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        </BrowserRouter>
      );

      const toggleButton = screen.getByText('Toggle Theme');
      const themeMode = screen.getByTestId('theme-mode');

      expect(themeMode).toHaveTextContent('light');

      fireEvent.click(toggleButton);
      expect(themeMode).toHaveTextContent('dark');

      fireEvent.click(toggleButton);
      expect(themeMode).toHaveTextContent('light');
    });

    test('should load theme from localStorage', () => {
      localStorage.setItem('theme', 'dark');

      const TestComponent = () => {
        const { theme } = useTheme();
        
        return (
          <div>
            <span data-testid="theme-mode">{theme.mode}</span>
          </div>
        );
      };

      render(
        <BrowserRouter>
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    });
  });
});

describe('ProductContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useProducts hook', () => {
    test('should provide product methods and state', () => {
      const TestComponent = () => {
        const { products, loading, error, fetchProducts } = useProducts();
        
        return (
          <div>
            <span data-testid="loading">{loading.toString()}</span>
            <span data-testid="error">{error || ''}</span>
            <span data-testid="products-count">{products.length}</span>
            <button onClick={() => fetchProducts()}>Fetch Products</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('');
      expect(screen.getByTestId('products-count')).toHaveTextContent('0');
    });

    test('should fetch products successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            products: [
              { id: 'product-1', title: 'Product 1', price: 29.99 },
              { id: 'product-2', title: 'Product 2', price: 39.99 }
            ],
            pagination: { total: 2, pages: 1, currentPage: 1 }
          }
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const TestComponent = () => {
        const { products, loading, fetchProducts } = useProducts();
        
        const handleFetch = async () => {
          await fetchProducts();
        };

        return (
          <div>
            <span data-testid="loading">{loading.toString()}</span>
            <span data-testid="products-count">{products.length}</span>
            <button onClick={handleFetch}>Fetch Products</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const fetchButton = screen.getByText('Fetch Products');
      fireEvent.click(fetchButton);

      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('products-count')).toHaveTextContent('2');
      });

      expect(api.get).toHaveBeenCalledWith('/products', { params: expect.any(Object) });
    });

    test('should handle fetch products error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Failed to fetch products'
          }
        }
      };

      api.get.mockRejectedValue(mockError);

      const TestComponent = () => {
        const { loading, error, fetchProducts } = useProducts();
        
        const handleFetch = async () => {
          await fetchProducts();
        };

        return (
          <div>
            <span data-testid="loading">{loading.toString()}</span>
            <span data-testid="error">{error || ''}</span>
            <button onClick={handleFetch}>Fetch Products</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const fetchButton = screen.getByText('Fetch Products');
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch products');
      });
    });
  });
});
