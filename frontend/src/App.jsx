import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import { ThemeProvider } from './contexts/ThemeContext.js';
import { ProductProvider } from './contexts/ProductContext.js';

// Components
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

// Pages
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';

// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // This will be implemented with AuthContext
  const isAuthenticated = localStorage.getItem('accessToken'); // Temporary check
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Layout Component
const Layout = ({ children }) => (
  <div className="app">
    <Header />
    <main className="main-content">
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </main>
    <Footer />
  </div>
);

// Public Layout (without Header/Footer for auth pages)
const PublicLayout = ({ children }) => (
  <div className="app auth-layout">
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            
            <Route path="/products" element={
              <Layout>
                <Products />
              </Layout>
            } />
            
            {/* Auth routes */}
            <Route path="/login" element={
              <PublicLayout>
                <Login />
              </PublicLayout>
            } />
            
            <Route path="/register" element={
              <PublicLayout>
                <Register />
              </PublicLayout>
            } />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={
              <Layout>
                <div className="not-found">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/">Go back home</a>
                </div>
              </Layout>
            } />
          </Routes>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
