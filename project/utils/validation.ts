import { z } from 'zod';

// Define validation schemas
export const ValidationSchemas = {
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  
  phoneNumber: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
  
  deviceFingerprint: z.string()
    .min(32, 'Invalid device fingerprint')
    .max(128, 'Device fingerprint too long'),
  
  encryptionKey: z.string()
    .regex(/^[A-Za-z0-9+/]+=*$/, 'Invalid base64 encryption key'),
  
  messageContent: z.string()
    .max(10000, 'Message too long')
    .refine(content => !content.includes('<script'), 'Invalid content detected'),
  
  fileName: z.string()
    .min(1, 'Filename required')
    .max(255, 'Filename too long')
    .regex(/^[^<>:"/\\|?*\x00-\x1f]+$/, 'Invalid filename characters'),
  
  fileSize: z.number()
    .min(1, 'File cannot be empty')
    .max(5 * 1024 * 1024 * 1024, 'File too large (max 5GB)'),
};

export class InputValidator {
  /**
   * Validate and sanitize user input
   */
  public static validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  /**
   * Sanitize HTML content
   */
  public static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate file upload
   */
  public static validateFile(file: { name: string; size: number; type: string }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate filename
    const nameResult = this.validate(ValidationSchemas.fileName, file.name);
    if (!nameResult.success) {
      errors.push(...nameResult.errors);
    }
    
    // Validate file size
    const sizeResult = this.validate(ValidationSchemas.fileSize, file.size);
    if (!sizeResult.success) {
      errors.push(...sizeResult.errors);
    }
    
    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/json',
      'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }
    
    return { valid: errors.length === 0, errors };
  }

  /**
   * Rate limiting validation
   */
  public static checkRateLimit(userId: string, action: string, limit: number, windowMs: number): boolean {
    const key = `${userId}:${action}`;
    const now = Date.now();
    
    // In production, use Redis or similar
    const attempts = this.getRateLimitAttempts(key, windowMs);
    
    if (attempts >= limit) {
      return false;
    }
    
    this.recordRateLimitAttempt(key, now);
    return true;
  }

  private static rateLimitStore = new Map<string, number[]>();

  private static getRateLimitAttempts(key: string, windowMs: number): number {
    const now = Date.now();
    const attempts = this.rateLimitStore.get(key) || [];
    
    // Filter out old attempts
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    this.rateLimitStore.set(key, validAttempts);
    
    return validAttempts.length;
  }

  private static recordRateLimitAttempt(key: string, timestamp: number): void {
    const attempts = this.rateLimitStore.get(key) || [];
    attempts.push(timestamp);
    this.rateLimitStore.set(key, attempts);
  }
}

// Add zod dependency to package.json
export const requiredDependency = 'zod';