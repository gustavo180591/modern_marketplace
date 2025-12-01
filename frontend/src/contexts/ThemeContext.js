import React, { createContext, useContext, useState, useEffect } from 'react';

// Initial theme
const initialTheme = {
  mode: 'light',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0'
  }
};

const darkTheme = {
  mode: 'dark',
  colors: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155'
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(initialTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme(darkTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', theme.mode);

    // Save to localStorage
    localStorage.setItem('theme', theme.mode);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => 
      prevTheme.mode === 'light' ? darkTheme : initialTheme
    );
  };

  // Set specific theme function
  const setThemeMode = (mode) => {
    setTheme(mode === 'dark' ? darkTheme : initialTheme);
  };

  // Get current theme mode
  const getThemeMode = () => theme.mode;

  // Get specific color
  const getColor = (colorName) => theme.colors[colorName];

  const value = {
    theme,
    toggleTheme,
    setThemeMode,
    getThemeMode,
    getColor,
    isDark: theme.mode === 'dark',
    isLight: theme.mode === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export default ThemeContext;
