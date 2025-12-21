import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        // Verify token with backend
        const response = await authAPI.getCurrentUser();
        setUser(response.user);
        setSubscription(response.user.subscription);
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // If email verification is required
      if (response.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          error: response.error || 'Email not verified'
        };
      }
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userName', response.user.name);
      localStorage.setItem('userEmail', response.user.email);
      
      setUser(response.user);
      setSubscription(response.user.subscription);
      
      return { success: true };
    } catch (error) {
      const errorResponse = error.response?.data;
      
      // Handle verification required error
      if (error.response?.status === 403 && errorResponse?.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          error: errorResponse.error || 'Email not verified',
          email: errorResponse.email
        };
      }
      
      return { success: false, error: errorResponse?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // If email verification is required
      if (response.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          error: response.message || 'Please verify your email',
          email: response.email
        };
      }
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userName', response.user.name);
      localStorage.setItem('userEmail', response.user.email);
      
      setUser(response.user);
      setSubscription(response.user.subscription);
      
      return { success: true };
    } catch (error) {
      const errorResponse = error.response?.data;
      
      // Handle verification required error
      if (errorResponse?.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          error: errorResponse.message || 'Please verify your email'
        };
      }
      
      return { success: false, error: errorResponse?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setUser(null);
    setSubscription(null);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const updateSubscription = (subscriptionData) => {
    setSubscription(subscriptionData);
    if (user) {
      const updatedUser = { ...user, subscription: subscriptionData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      subscription,
      loading,
      login,
      register,
      logout,
      updateUser,
      updateSubscription,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};