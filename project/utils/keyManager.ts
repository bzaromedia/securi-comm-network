import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { secureStorage } from './storage';

export interface KeyMetadata {
  id: string;
  created: number;
  lastUsed: number;
  rotationDue: number;
  algorithm: string;
}

export class SecureKeyManager {
  private static instance: SecureKeyManager;
  private activeKeys = new Map<string, Uint8Array>();
  private keyMetadata = new Map<string, KeyMetadata>();
  private readonly KEY_ROTATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Auto-cleanup on app backgrounding
    if (Platform.OS !== 'web') {
      // Set up app state listeners for key cleanup
      this.setupAppStateListeners();
    }
  }

  public static getInstance(): SecureKeyManager {
    if (!SecureKeyManager.instance) {
      SecureKeyManager.instance = new SecureKeyManager();
    }
    return SecureKeyManager.instance;
  }

  /**
   * Store key securely with metadata
   */
  public async storeKey(keyId: string, key: Uint8Array, algorithm: string): Promise<void> {
    try {
      // Store key in secure storage
      const keyBase64 = Buffer.from(key).toString('base64');
      await secureStorage.setItem(`key_${keyId}`, keyBase64, { 
        encrypt: true, 
        requireAuthentication: true 
      });

      // Store metadata
      const metadata: KeyMetadata = {
        id: keyId,
        created: Date.now(),
        lastUsed: Date.now(),
        rotationDue: Date.now() + this.KEY_ROTATION_INTERVAL,
        algorithm
      };

      await secureStorage.setItem(`meta_${keyId}`, JSON.stringify(metadata));
      this.keyMetadata.set(keyId, metadata);

      // Keep in memory for active use
      this.activeKeys.set(keyId, key);
    } catch (error) {
      console.error('Failed to store key:', error);
      throw new Error('Key storage failed');
    }
  }

  /**
   * Retrieve key with automatic rotation check
   */
  public async getKey(keyId: string): Promise<Uint8Array | null> {
    try {
      // Check if key is in memory
      let key = this.activeKeys.get(keyId);
      
      if (!key) {
        // Load from secure storage
        const keyBase64 = await secureStorage.getItem(`key_${keyId}`, { encrypt: true });
        if (!keyBase64) return null;
        
        key = new Uint8Array(Buffer.from(keyBase64, 'base64'));
        this.activeKeys.set(keyId, key);
      }

      // Update last used time
      const metadata = this.keyMetadata.get(keyId);
      if (metadata) {
        metadata.lastUsed = Date.now();
        await secureStorage.setItem(`meta_${keyId}`, JSON.stringify(metadata));
      }

      // Check if rotation is needed
      if (metadata && Date.now() > metadata.rotationDue) {
        console.warn(`Key ${keyId} requires rotation`);
        // Trigger rotation in background
        this.scheduleKeyRotation(keyId);
      }

      return key;
    } catch (error) {
      console.error('Failed to retrieve key:', error);
      return null;
    }
  }

  /**
   * Securely delete key from all storage
   */
  public async deleteKey(keyId: string): Promise<void> {
    try {
      // Clear from memory
      const key = this.activeKeys.get(keyId);
      if (key) {
        // Zero out memory
        key.fill(0);
        this.activeKeys.delete(keyId);
      }

      // Remove from secure storage
      await secureStorage.removeItem(`key_${keyId}`);
      await secureStorage.removeItem(`meta_${keyId}`);
      
      this.keyMetadata.delete(keyId);
    } catch (error) {
      console.error('Failed to delete key:', error);
    }
  }

  /**
   * Rotate key with backward compatibility
   */
  public async rotateKey(keyId: string, newKey: Uint8Array): Promise<void> {
    try {
      // Store old key with rotation suffix
      const oldKey = await this.getKey(keyId);
      if (oldKey) {
        await this.storeKey(`${keyId}_old`, oldKey, 'rotated');
      }

      // Store new key
      const metadata = this.keyMetadata.get(keyId);
      await this.storeKey(keyId, newKey, metadata?.algorithm || 'XChaCha20-Poly1305');

      console.log(`Key ${keyId} rotated successfully`);
    } catch (error) {
      console.error('Key rotation failed:', error);
      throw error;
    }
  }

  /**
   * Clear all keys from memory (for app backgrounding)
   */
  public clearMemoryKeys(): void {
    for (const [keyId, key] of this.activeKeys) {
      key.fill(0); // Zero out memory
    }
    this.activeKeys.clear();
  }

  /**
   * Get keys requiring rotation
   */
  public getKeysRequiringRotation(): string[] {
    const now = Date.now();
    return Array.from(this.keyMetadata.entries())
      .filter(([, metadata]) => now > metadata.rotationDue)
      .map(([keyId]) => keyId);
  }

  private scheduleKeyRotation(keyId: string): void {
    // Schedule rotation in background
    setTimeout(async () => {
      try {
        const newKey = crypto.getRandomValues(new Uint8Array(32));
        await this.rotateKey(keyId, newKey);
      } catch (error) {
        console.error('Scheduled key rotation failed:', error);
      }
    }, 1000);
  }

  private setupAppStateListeners(): void {
    // Clear keys when app goes to background
    if (Platform.OS !== 'web') {
      const { AppState } = require('react-native');
      AppState.addEventListener('change', (nextAppState: string) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          this.clearMemoryKeys();
        }
      });
    }
  }
}

export const keyManager = SecureKeyManager.getInstance();