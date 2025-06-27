/**
 * SecuriComm Auth Context
 * 
 * Provides authentication state and methods for the entire application.
 * Manages user authentication, registration, and session management.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { secureStorage, StorageKeys } from '@/utils/storage';

// User interface
export interface User {
  userID: string;
  email: string;
  displayName: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  updateProfile: async () => false,
  changePassword: async () => false,
  resetPassword: async () => false,
  verifyEmail: async () => false,
  refreshToken: async () => false,
});

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);
  
  // Initialize auth
  const initializeAuth = async () => {
    try {
      // Check if token exists
      const token = await secureStorage.getItem(StorageKeys.AUTH_TOKEN);
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      // Get user data
      await getCurrentUser();
    } catch (error) {
      console.error('Initialize auth error:', error);
      setIsLoading(false);
    }
  };
  
  // Get current user
  const getCurrentUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get user from API
      const response = await api.auth.getCurrentUser();
      
      if (!response.success) {
        // Clear token if unauthorized
        if (response.statusCode === 401) {
          await secureStorage.removeItem(StorageKeys.AUTH_TOKEN);
          await secureStorage.removeItem(StorageKeys.USER_ID);
        }
        
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return false;
      }
      
      // Update user state
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Store user ID
        await secureStorage.setItem(
          StorageKeys.USER_ID,
          response.data.user.userID
        );
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Get current user error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to get user data'
      );
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };
  
  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Login with API
      const response = await api.auth.login(email, password);
      
      if (!response.success) {
        setError(response.message || 'Login failed');
        setIsLoading(false);
        return false;
      }
      
      // Store token
      if (response.data && response.data.token) {
        await secureStorage.setItem(StorageKeys.AUTH_TOKEN, response.data.token);
      }
      
      // Get user data
      const success = await getCurrentUser();
      
      setIsLoading(false);
      return success;
    } catch (error) {
      console.error('Login error:', error);
      
      setError(error instanceof Error ? error.message : 'Login failed');
      setIsLoading(false);
      return false;
    }
  };
  
  // Register
  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Register with API
      const response = await api.auth.register(email, password, displayName);
      
      if (!response.success) {
        setError(response.message || 'Registration failed');
        setIsLoading(false);
        return false;
      }
      
      // Store token
      if (response.data && response.data.token) {
        await secureStorage.setItem(StorageKeys.AUTH_TOKEN, response.data.token);
      }
      
      // Get user data
      const success = await getCurrentUser();
      
      setIsLoading(false);
      return success;
    } catch (error) {
      console.error('Register error:', error);
      
      setError(error instanceof Error ? error.message : 'Registration failed');
      setIsLoading(false);
      return false;
    }
  };
  
  // Logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Logout with API
      await api.auth.logout();
      
      // Clear token and user data
      await secureStorage.removeItem(StorageKeys.AUTH_TOKEN);
      await secureStorage.removeItem(StorageKeys.USER_ID);
      
      // Update state
      setIsAuthenticated(false);
      setUser(null);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear token and user data anyway
      await secureStorage.removeItem(StorageKeys.AUTH_TOKEN);
      await secureStorage.removeItem(StorageKeys.USER_ID);
      
      // Update state
      setIsAuthenticated(false);
      setUser(null);
      
      setIsLoading(false);
    }
  };
  
  // Update profile
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update profile with API
      const response = await api.auth.updateProfile(data);
      
      if (!response.success) {
        setError(response.message || 'Failed to update profile');
        setIsLoading(false);
        return false;
      }
      
      // Update user state
      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
      setIsLoading(false);
      return false;
    }
  };
  
  // Change password
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Change password with API
      const response = await api.auth.changePassword(
        currentPassword,
        newPassword
      );
      
      if (!response.success) {
        setError(response.message || 'Failed to change password');
        setIsLoading(false);
        return false;
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to change password'
      );
      setIsLoading(false);
      return false;
    }
  };
  
  // Reset password
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Reset password with API
      const response = await api.auth.requestPasswordReset(email);
      
      if (!response.success) {
        setError(response.message || 'Failed to reset password');
        setIsLoading(false);
        return false;
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to reset password'
      );
      setIsLoading(false);
      return false;
    }
  };
  
  // Verify email
  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verify email with API
      const response = await api.auth.verifyEmail(token);
      
      if (!response.success) {
        setError(response.message || 'Failed to verify email');
        setIsLoading(false);
        return false;
      }
      
      // Update user state if already authenticated
      if (isAuthenticated && user) {
        setUser({
          ...user,
          isVerified: true,
        });
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Verify email error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to verify email'
      );
      setIsLoading(false);
      return false;
    }
  };
  
  // Refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Refresh token with API
      const response = await api.auth.refreshToken();
      
      if (!response.success) {
        // Clear token if unauthorized
        if (response.statusCode === 401) {
          await secureStorage.removeItem(StorageKeys.AUTH_TOKEN);
          await secureStorage.removeItem(StorageKeys.USER_ID);
          
          setIsAuthenticated(false);
          setUser(null);
        }
        
        setError(response.message || 'Failed to refresh token');
        setIsLoading(false);
        return false;
      }
      
      // Store new token
      if (response.data && response.data.token) {
        await secureStorage.setItem(StorageKeys.AUTH_TOKEN, response.data.token);
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Refresh token error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to refresh token'
      );
      setIsLoading(false);
      return false;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        resetPassword,
        verifyEmail,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Auth hook
export const useAuth = () => useContext(AuthContext);
