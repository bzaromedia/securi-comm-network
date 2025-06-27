/**
 * SecuriComm Encryption Service
 * 
 * Provides encryption functionality for secure communication.
 * Uses XChaCha20-Poly1305 for end-to-end encryption.
 */

import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import { secureStorage, StorageKeys } from './storage';
import { Buffer } from 'buffer';

// Import tweetnacl and tweetnacl-util
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

// Key pair interface
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generate random bytes
 */
export const generateRandomBytes = async (length: number): Promise<Uint8Array> => {
  return await Random.getRandomBytesAsync(length);
};

/**
 * Generate key pair
 */
export const generateKeyPair = async (): Promise<KeyPair> => {
  try {
    // Check if key pair already exists
    const hasKeyPair = await secureStorage.hasItem(StorageKeys.PUBLIC_KEY) &&
      await secureStorage.hasItem(StorageKeys.PRIVATE_KEY);
    
    if (hasKeyPair) {
      const publicKey = await secureStorage.getItem(StorageKeys.PUBLIC_KEY);
      const privateKey = await secureStorage.getItem(StorageKeys.PRIVATE_KEY);
      
      if (publicKey && privateKey) {
        return {
          publicKey,
          privateKey,
        };
      }
    }
    
    // Generate new key pair
    const keyPair = nacl.box.keyPair();
    
    // Convert keys to base64
    const publicKeyBase64 = util.encodeBase64(keyPair.publicKey);
    const privateKeyBase64 = util.encodeBase64(keyPair.secretKey);
    
    return {
      publicKey: publicKeyBase64,
      privateKey: privateKeyBase64,
    };
  } catch (error) {
    console.error('Generate key pair error:', error);
    throw new Error('Failed to generate key pair');
  }
};

/**
 * Store key pair
 */
export const storeKeyPair = async (keyPair: KeyPair): Promise<void> => {
  try {
    await secureStorage.setItem(StorageKeys.PUBLIC_KEY, keyPair.publicKey);
    await secureStorage.setItem(StorageKeys.PRIVATE_KEY, keyPair.privateKey);
  } catch (error) {
    console.error('Store key pair error:', error);
    throw new Error('Failed to store key pair');
  }
};

/**
 * Get key pair
 */
export const getKeyPair = async (): Promise<KeyPair | null> => {
  try {
    const publicKey = await secureStorage.getItem(StorageKeys.PUBLIC_KEY);
    const privateKey = await secureStorage.getItem(StorageKeys.PRIVATE_KEY);
    
    if (!publicKey || !privateKey) {
      return null;
    }
    
    return {
      publicKey,
      privateKey,
    };
  } catch (error) {
    console.error('Get key pair error:', error);
    return null;
  }
};

/**
 * Generate shared key
 */
export const generateSharedKey = async (
  theirPublicKey: string
): Promise<Uint8Array> => {
  try {
    // Get key pair
    const keyPair = await getKeyPair();
    
    if (!keyPair) {
      throw new Error('Key pair not found');
    }
    
    // Convert keys from base64
    const publicKey = util.decodeBase64(theirPublicKey);
    const privateKey = util.decodeBase64(keyPair.privateKey);
    
    // Generate shared key
    return nacl.box.before(publicKey, privateKey);
  } catch (error) {
    console.error('Generate shared key error:', error);
    throw new Error('Failed to generate shared key');
  }
};

/**
 * Encrypt message
 */
export const encryptMessage = async (
  message: string,
  key: string
): Promise<string> => {
  try {
    // Convert key from base64 or hex
    let keyBytes: Uint8Array;
    
    if (key.length === 64) {
      // Hex key
      keyBytes = Buffer.from(key, 'hex');
    } else {
      // Base64 key
      keyBytes = util.decodeBase64(key);
    }
    
    // Generate nonce
    const nonce = await generateRandomBytes(nacl.secretbox.nonceLength);
    
    // Convert message to Uint8Array
    const messageBytes = util.decodeUTF8(message);
    
    // Encrypt message
    const encryptedBytes = nacl.secretbox(messageBytes, nonce, keyBytes);
    
    // Combine nonce and encrypted message
    const fullMessage = new Uint8Array(nonce.length + encryptedBytes.length);
    fullMessage.set(nonce);
    fullMessage.set(encryptedBytes, nonce.length);
    
    // Convert to base64
    return util.encodeBase64(fullMessage);
  } catch (error) {
    console.error('Encrypt message error:', error);
    throw new Error('Failed to encrypt message');
  }
};

/**
 * Decrypt message
 */
export const decryptMessage = async (
  encryptedMessage: string,
  key: string
): Promise<string> => {
  try {
    // Convert key from base64 or hex
    let keyBytes: Uint8Array;
    
    if (key.length === 64) {
      // Hex key
      keyBytes = Buffer.from(key, 'hex');
    } else {
      // Base64 key
      keyBytes = util.decodeBase64(key);
    }
    
    // Convert encrypted message from base64
    const encryptedBytes = util.decodeBase64(encryptedMessage);
    
    // Extract nonce and message
    const nonce = encryptedBytes.slice(0, nacl.secretbox.nonceLength);
    const message = encryptedBytes.slice(nacl.secretbox.nonceLength);
    
    // Decrypt message
    const decryptedBytes = nacl.secretbox.open(message, nonce, keyBytes);
    
    if (!decryptedBytes) {
      throw new Error('Failed to decrypt message');
    }
    
    // Convert to string
    return util.encodeUTF8(decryptedBytes);
  } catch (error) {
    console.error('Decrypt message error:', error);
    throw new Error('Failed to decrypt message');
  }
};

/**
 * Generate conversation key
 */
export const generateConversationKey = async (): Promise<string> => {
  try {
    // Generate random bytes
    const keyBytes = await generateRandomBytes(nacl.secretbox.keyLength);
    
    // Convert to hex
    return Buffer.from(keyBytes).toString('hex');
  } catch (error) {
    console.error('Generate conversation key error:', error);
    throw new Error('Failed to generate conversation key');
  }
};

/**
 * Hash data
 */
export const hashData = async (data: string): Promise<string> => {
  try {
    // Hash data with SHA-256
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
    
    return hash;
  } catch (error) {
    console.error('Hash data error:', error);
    throw new Error('Failed to hash data');
  }
};

/**
 * Generate secure random string
 */
export const generateSecureRandomString = async (length: number): Promise<string> => {
  try {
    // Generate random bytes
    const randomBytes = await generateRandomBytes(length);
    
    // Convert to base64 and remove non-alphanumeric characters
    const base64 = util.encodeBase64(randomBytes);
    const alphanumeric = base64.replace(/[^a-zA-Z0-9]/g, '');
    
    // Return substring of specified length
    return alphanumeric.substring(0, length);
  } catch (error) {
    console.error('Generate secure random string error:', error);
    throw new Error('Failed to generate secure random string');
  }
};

/**
 * Encrypt file
 */
export const encryptFile = async (
  fileData: Uint8Array,
  key: string
): Promise<Uint8Array> => {
  try {
    // Convert key from base64 or hex
    let keyBytes: Uint8Array;
    
    if (key.length === 64) {
      // Hex key
      keyBytes = Buffer.from(key, 'hex');
    } else {
      // Base64 key
      keyBytes = util.decodeBase64(key);
    }
    
    // Generate nonce
    const nonce = await generateRandomBytes(nacl.secretbox.nonceLength);
    
    // Encrypt file
    const encryptedBytes = nacl.secretbox(fileData, nonce, keyBytes);
    
    // Combine nonce and encrypted file
    const fullMessage = new Uint8Array(nonce.length + encryptedBytes.length);
    fullMessage.set(nonce);
    fullMessage.set(encryptedBytes, nonce.length);
    
    return fullMessage;
  } catch (error) {
    console.error('Encrypt file error:', error);
    throw new Error('Failed to encrypt file');
  }
};

/**
 * Decrypt file
 */
export const decryptFile = async (
  encryptedData: Uint8Array,
  key: string
): Promise<Uint8Array> => {
  try {
    // Convert key from base64 or hex
    let keyBytes: Uint8Array;
    
    if (key.length === 64) {
      // Hex key
      keyBytes = Buffer.from(key, 'hex');
    } else {
      // Base64 key
      keyBytes = util.decodeBase64(key);
    }
    
    // Extract nonce and file
    const nonce = encryptedData.slice(0, nacl.secretbox.nonceLength);
    const data = encryptedData.slice(nacl.secretbox.nonceLength);
    
    // Decrypt file
    const decryptedBytes = nacl.secretbox.open(data, nonce, keyBytes);
    
    if (!decryptedBytes) {
      throw new Error('Failed to decrypt file');
    }
    
    return decryptedBytes;
  } catch (error) {
    console.error('Decrypt file error:', error);
    throw new Error('Failed to decrypt file');
  }
};
