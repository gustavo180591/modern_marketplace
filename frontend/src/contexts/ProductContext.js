import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../utils/api.js';

// Initial state
const initialState = {
  products: [],
  featuredProducts: [],
  categories: [],
  currentProduct: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  },
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1
  }
};

// Action types
const PRODUCT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_FEATURED_PRODUCTS: 'SET_FEATURED_PRODUCTS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_CURRENT_PRODUCT: 'SET_CURRENT_PRODUCT',
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  RESET_FILTERS: 'RESET_FILTERS',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  REMOVE_PRODUCT: 'REMOVE_PRODUCT'
};

// Reducer function
const productReducer = (state, action) => {
  switch (action.type) {
    case PRODUCT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case PRODUCT_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case PRODUCT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case PRODUCT_ACTIONS.SET_PRODUCTS:
      return {
        ...state,
        products: action.payload.products,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };

    case PRODUCT_ACTIONS.SET_FEATURED_PRODUCTS:
      return {
        ...state,
        featuredProducts: action.payload,
        loading: false
      };

    case PRODUCT_ACTIONS.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload
      };

    case PRODUCT_ACTIONS.SET_CURRENT_PRODUCT:
      return {
        ...state,
        currentProduct: action.payload,
        loading: false,
        error: null
      };

    case PRODUCT_ACTIONS.UPDATE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case PRODUCT_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload
        }
      };

    case PRODUCT_ACTIONS.RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
        pagination: initialState.pagination
      };

    case PRODUCT_ACTIONS.ADD_PRODUCT:
      return {
        ...state,
        products: [action.payload, ...state.products]
      };

    case PRODUCT_ACTIONS.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        ),
        currentProduct: state.currentProduct?.id === action.payload.id 
          ? action.payload 
          : state.currentProduct
      };

    case PRODUCT_ACTIONS.REMOVE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
        currentProduct: state.currentProduct?.id === action.payload ? null : state.currentProduct
      };

    default:
      return state;
  }
};

// Create context
const ProductContext = createContext();

// Product provider component
export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Fetch products with filters
  const fetchProducts = async (filters = {}) => {
    dispatch({ type: PRODUCT_ACTIONS.SET_LOADING, payload: true });

    try {
      const params = { ...state.filters, ...filters };
      const response = await api.get('/products', { params });

      dispatch({
        type: PRODUCT_ACTIONS.SET_PRODUCTS,
        payload: {
          products: response.data.data.products,
          pagination: response.data.data.pagination
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch products';
      dispatch({
        type: PRODUCT_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch featured products
  const fetchFeaturedProducts = async (limit = 10) => {
    dispatch({ type: PRODUCT_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await api.get('/products/featured', { params: { limit } });

      dispatch({
        type: PRODUCT_ACTIONS.SET_FEATURED_PRODUCTS,
        payload: response.data.data.products
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch featured products';
      dispatch({
        type: PRODUCT_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');

      dispatch({
        type: PRODUCT_ACTIONS.SET_CATEGORIES,
        payload: response.data.data.categories
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch categories';
      dispatch({
        type: PRODUCT_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch single product
  const fetchProduct = async (id) => {
    dispatch({ type: PRODUCT_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await api.get(`/products/${id}`);

      dispatch({
        type: PRODUCT_ACTIONS.SET_CURRENT_PRODUCT,
        payload: response.data.data.product
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch product';
      dispatch({
        type: PRODUCT_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Create product (for sellers)
  const createProduct = async (productData) => {
    dispatch({ type: PRODUCT_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await api.post('/products', productData);

      dispatch({
        type: PRODUCT_ACTIONS.ADD_PRODUCT,
        payload: response.data.data.product
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create product';
      dispatch({
        type: PRODUCT_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update product
  const updateProduct = async (id, productData) => {
    dispatch({ type: PRODUCT_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await api.put(`/products/${id}`, productData);

      dispatch({
        type: PRODUCT_ACTIONS.UPDATE_PRODUCT,
        payload: response.data.data.product
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update product';
      dispatch({
        type: PRODUCT_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    dispatch({ type: PRODUCT_ACTIONS.SET_LOADING, payload: true });

    try {
      await api.delete(`/products/${id}`);

      dispatch({
        type: PRODUCT_ACTIONS.REMOVE_PRODUCT,
        payload: id
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete product';
      dispatch({
        type: PRODUCT_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    dispatch({
      type: PRODUCT_ACTIONS.UPDATE_FILTERS,
      payload: newFilters
    });
  };

  // Reset filters
  const resetFilters = () => {
    dispatch({ type: PRODUCT_ACTIONS.RESET_FILTERS });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: PRODUCT_ACTIONS.CLEAR_ERROR });
  };

  // Initialize data
  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const value = {
    // State
    ...state,

    // Actions
    fetchProducts,
    fetchFeaturedProducts,
    fetchCategories,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateFilters,
    resetFilters,
    clearError
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use product context
export const useProducts = () => {
  const context = useContext(ProductContext);
  
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }

  return context;
};

export default ProductContext;
