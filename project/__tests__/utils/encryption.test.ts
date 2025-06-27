import { encryption, NaimaraEncryption } from '../../utils/encryption';
import { Platform } from 'react-native';

// Mock Platform for testing
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

describe('NaimaraEncryption', () => {
  let encryptionInstance: NaimaraEncryption;

  beforeEach(() => {
    encryptionInstance = NaimaraEncryption.getInstance();
  });

  afterEach(() => {
    encryptionInstance.clearKeys();
  });

  describe('Key Generation', () => {
    test('should generate valid key pair', () => {
      const keys = encryptionInstance.generateKeyPair();
      
      expect(keys.publicKey).toBeDefined();
      expect(keys.privateKey).toBeDefined();
      expect(typeof keys.publicKey).toBe('string');
      expect(typeof keys.privateKey).toBe('string');
      expect(keys.publicKey.length).toBeGreaterThan(0);
      expect(keys.privateKey.length).toBeGreaterThan(0);
    });

    test('should generate unique key pairs', () => {
      const keys1 = encryptionInstance.generateKeyPair();
      const keys2 = encryptionInstance.generateKeyPair();
      
      expect(keys1.publicKey).not.toBe(keys2.publicKey);
      expect(keys1.privateKey).not.toBe(keys2.privateKey);
    });

    test('should generate valid secret key', () => {
      const secretKey = encryptionInstance.generateSecretKey();
      
      expect(secretKey).toBeDefined();
      expect(typeof secretKey).toBe('string');
      expect(secretKey.length).toBeGreaterThan(0);
    });
  });

  describe('Encryption/Decryption', () => {
    test('should encrypt and decrypt data successfully', () => {
      const testData = 'Hello, SecuriComm!';
      const secretKey = encryptionInstance.generateSecretKey();
      
      const encrypted = encryptionInstance.encryptData(testData);
      expect(encrypted.data).toBeDefined();
      expect(encrypted.nonce).toBeDefined();
      expect(encrypted.algorithm).toBe('XChaCha20-Poly1305');
      
      const decrypted = encryptionInstance.decryptData(encrypted);
      expect(decrypted).toBe(testData);
    });

    test('should handle empty data', () => {
      const secretKey = encryptionInstance.generateSecretKey();
      const encrypted = encryptionInstance.encryptData('');
      const decrypted = encryptionInstance.decryptData(encrypted);
      
      expect(decrypted).toBe('');
    });

    test('should handle large data', () => {
      const largeData = 'A'.repeat(10000);
      const secretKey = encryptionInstance.generateSecretKey();
      
      const encrypted = encryptionInstance.encryptData(largeData);
      const decrypted = encryptionInstance.decryptData(encrypted);
      
      expect(decrypted).toBe(largeData);
    });

    test('should fail with invalid encrypted data', () => {
      const invalidData = {
        data: 'invalid',
        nonce: 'invalid',
        timestamp: Date.now(),
        algorithm: 'XChaCha20-Poly1305',
      };
      
      expect(() => {
        encryptionInstance.decryptData(invalidData);
      }).toThrow();
    });
  });

  describe('Hash Generation', () => {
    test('should generate consistent hashes', async () => {
      const testData = 'test data';
      const hash1 = await encryptionInstance.generateHash(testData);
      const hash2 = await encryptionInstance.generateHash(testData);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toBeDefined();
      expect(typeof hash1).toBe('string');
    });

    test('should generate different hashes for different data', async () => {
      const hash1 = await encryptionInstance.generateHash('data1');
      const hash2 = await encryptionInstance.generateHash('data2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Integrity Verification', () => {
    test('should verify data integrity correctly', async () => {
      const testData = 'integrity test data';
      const hash = await encryptionInstance.generateHash(testData);
      
      const isValid = await encryptionInstance.verifyIntegrity(testData, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await encryptionInstance.verifyIntegrity('modified data', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Key Derivation', () => {
    test('should derive consistent keys from same input', () => {
      const password = 'test-password';
      const salt = 'test-salt';
      
      const key1 = encryptionInstance.deriveKey(password, salt);
      const key2 = encryptionInstance.deriveKey(password, salt);
      
      expect(key1).toBe(key2);
    });

    test('should derive different keys from different inputs', () => {
      const key1 = encryptionInstance.deriveKey('password1', 'salt');
      const key2 = encryptionInstance.deriveKey('password2', 'salt');
      const key3 = encryptionInstance.deriveKey('password1', 'different-salt');
      
      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });
  });
});