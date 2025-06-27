import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

export class SecureRandom {
  /**
   * Generate cryptographically secure random number between 0 and 1
   */
  public static async random(): Promise<number> {
    if (Platform.OS === 'web') {
      // Use Web Crypto API
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0] / (0xffffffff + 1);
    } else {
      // Use Expo Crypto
      const randomBytes = await Crypto.getRandomBytesAsync(4);
      const view = new DataView(randomBytes.buffer);
      return view.getUint32(0, false) / (0xffffffff + 1);
    }
  }

  /**
   * Generate secure random integer between min and max (inclusive)
   */
  public static async randomInt(min: number, max: number): Promise<number> {
    const random = await this.random();
    return Math.floor(random * (max - min + 1)) + min;
  }

  /**
   * Generate secure random boolean with given probability
   */
  public static async randomBoolean(probability: number = 0.5): Promise<boolean> {
    const random = await this.random();
    return random < probability;
  }

  /**
   * Generate secure random bytes
   */
  public static async randomBytes(length: number): Promise<Uint8Array> {
    if (Platform.OS === 'web') {
      return crypto.getRandomValues(new Uint8Array(length));
    } else {
      const buffer = await Crypto.getRandomBytesAsync(length);
      return new Uint8Array(buffer);
    }
  }

  /**
   * Generate secure random string
   */
  public static async randomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): Promise<string> {
    const bytes = await this.randomBytes(length);
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }
    
    return result;
  }
}