import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Set the token in axios defaults for API calls
          apiService.setAuthToken(storedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (googleToken) => {
    try {
      setLoading(true);
      
      // Exchange Google token for our backend token
      const response = await apiService.loginWithGoogle(googleToken);
      
      // Extract token and user from the nested data structure
      const { access_token, user: userData } = response.data.data || response.data;
      
      if (!access_token) {
        throw new Error('No access token received from backend');
      }
      
      // Store token and user data
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      
      // Set the token in axios defaults for API calls
      apiService.setAuthToken(access_token);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Clear token from axios defaults
    apiService.clearAuthToken();
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: isAuthenticated()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
