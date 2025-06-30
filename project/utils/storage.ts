/**
 * SecuriComm Storage Service
 * 
 * Provides secure storage functionality for sensitive data.
 * Uses expo-secure-store for encrypted storage.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage keys enum
export enum StorageKeys {
  AUTH_TOKEN = 'auth_token',
  USER_ID = 'user_id',
  USER_DATA = 'user_data',
  PUBLIC_KEY = 'public_key',
  PRIVATE_KEY = 'private_key',
  DEVICE_ID = 'device_id',
  SETTINGS = 'settings',
  SECURITY_LEVEL = 'security_level',
  BIOMETRIC_ENABLED = 'biometric_enabled',
  EMERGENCY_CONTACTS = 'emergency_contacts',
  LAST_SYNC = 'last_sync',
  ENCRYPTION_VERSION = 'encryption_version',
}

// Web storage fallback
class WebStorageFallback {
  private storage: Record<string, string> = {};
  
  async getItem(key: string): Promise<string | null> {
    try {
      // Try to get from localStorage first
      const value = localStorage.getItem(key);
      
      if (value) {
        return value;
      }
      
      // Fall back to memory storage
      return this.storage[key] || null;
    } catch (error) {
      // If localStorage is not available, use memory storage
      return this.storage[key] || null;
    }
  }
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      // Try to set in localStorage first
      localStorage.setItem(key, value);
    } catch (error) {
      // If localStorage is not available, use memory storage
      this.storage[key] = value;
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      // Try to remove from localStorage first
      localStorage.removeItem(key);
    } catch (error) {
      // If localStorage is not available, use memory storage
      delete this.storage[key];
    }
  }
  
  async hasItem(key: string): Promise<boolean> {
    try {
      // Try to check localStorage first
      return localStorage.getItem(key) !== null;
    } catch (error) {
      // If localStorage is not available, use memory storage
      return key in this.storage;
    }
  }
  
  async getAllKeys(): Promise<string[]> {
    try {
      // Try to get keys from localStorage first
      return Object.keys(localStorage);
    } catch (error) {
      // If localStorage is not available, use memory storage
      return Object.keys(this.storage);
    }
  }
}

// Secure storage interface
class SecureStorage {
  private webFallback: WebStorageFallback;
  
  constructor() {
    this.webFallback = new WebStorageFallback();
  }
  
  /**
   * Get item from secure storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await this.webFallback.getItem(key);
      }
      
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Get item error:', error);
      return null;
    }
  }
  
  /**
   * Set item in secure storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await this.webFallback.setItem(key, value);
        return;
      }
      
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Set item error:', error);
      throw new Error('Failed to set item in secure storage');
    }
  }
  
  /**
   * Remove item from secure storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await this.webFallback.removeItem(key);
        return;
      }
      
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Remove item error:', error);
      throw new Error('Failed to remove item from secure storage');
    }
  }
  
  /**
   * Check if item exists in secure storage
   */
  async hasItem(key: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return await this.webFallback.hasItem(key);
      }
      
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch (error) {
      console.error('Has item error:', error);
      return false;
    }
  }
  
  /**
   * Get all keys from secure storage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      if (Platform.OS === 'web') {
        return await this.webFallback.getAllKeys();
      }
      
      // SecureStore doesn't have a method to get all keys
      // This is a limitation of the API
      console.warn('getAllKeys is not fully supported on this platform');
      return [];
    } catch (error) {
      console.error('Get all keys error:', error);
      return [];
    }
  }
  
  /**
   * Clear all items from secure storage
   */
  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        const keys = await this.webFallback.getAllKeys();
        
        for (const key of keys) {
          await this.webFallback.removeItem(key);
        }
        
        return;
      }
      
      // SecureStore doesn't have a method to clear all items
      // We need to remove each item individually
      // This is a limitation of the API
      console.warn('clear is not fully supported on this platform');
      
      // Remove known keys
      for (const key of Object.values(StorageKeys)) {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Clear error:', error);
      throw new Error('Failed to clear secure storage');
    }
  }
  
  /**
   * Store object in secure storage
   */
  async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error('Set object error:', error);
      throw new Error('Failed to set object in secure storage');
    }
  }
  
  /**
   * Get object from secure storage
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      
      if (!jsonValue) {
        return null;
      }
      
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error('Get object error:', error);
      return null;
    }
  }
}

// Export secure storage instance
export const secureStorage = new SecureStorage();

// Regular storage for non-sensitive data
export const storage = {
  /**
   * Get item from storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      
      // For non-web platforms, use secure storage
      return await secureStorage.getItem(key);
    } catch (error) {
      console.error('Get item error:', error);
      return null;
    }
  },
  
  /**
   * Set item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      
      // For non-web platforms, use secure storage
      await secureStorage.setItem(key, value);
    } catch (error) {
      console.error('Set item error:', error);
      throw new Error('Failed to set item in storage');
    }
  },
  
  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      
      // For non-web platforms, use secure storage
      await secureStorage.removeItem(key);
    } catch (error) {
      console.error('Remove item error:', error);
      throw new Error('Failed to remove item from storage');
    }
  },
  
  /**
   * Store object in storage
   */
  async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error('Set object error:', error);
      throw new Error('Failed to set object in storage');
    }
  },
  
  /**
   * Get object from storage
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      
      if (!jsonValue) {
        return null;
      }
      
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error('Get object error:', error);
      return null;
    }
  },
};
