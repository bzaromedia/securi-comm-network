// Core application types
export interface User {
  id: string;
  email: string;
  deviceId: string;
  permissions: Permission[];
  encryptionKeys: EncryptionKeys;
  settings: UserSettings;
  authTokens: AuthTokens;
  securityProfile: SecurityProfile;
  createdAt: number;
  lastActive: number;
}

export interface Permission {
  id: string;
  name: string;
  scope: 'read' | 'write' | 'admin';
  resource: string;
  expiresAt?: number;
}

export interface EncryptionKeys {
  publicKey: string;
  privateKey: string;
  secretKey?: string;
  keyId: string;
  algorithm: 'XChaCha20-Poly1305' | 'AES-256-GCM';
  createdAt: number;
  expiresAt: number;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'auto';
  language: string;
  notifications: NotificationSettings;
  security: SecuritySettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  enabled: boolean;
  messageNotifications: boolean;
  callNotifications: boolean;
  securityAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

export interface SecuritySettings {
  biometricAuth: boolean;
  autoLock: boolean;
  autoLockTimeout: number; // minutes
  screenSecurity: boolean;
  emergencyMode: boolean;
  meshNetworking: boolean;
}

export interface PrivacySettings {
  readReceipts: boolean;
  lastSeen: boolean;
  profileVisibility: 'everyone' | 'contacts' | 'nobody';
  dataRetention: number; // days
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: 'Bearer';
}

export interface SecurityProfile {
  trustScore: number;
  lastSecurityCheck: number;
  deviceFingerprint: string;
  riskLevel: 'low' | 'medium' | 'high';
  threats: ThreatInfo[];
}

export interface ThreatInfo {
  id: string;
  type: 'malware' | 'phishing' | 'network' | 'behavioral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: number;
  mitigated: boolean;
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: EncryptedContent;
  type: MessageType;
  timestamp: number;
  status: MessageStatus;
  metadata: MessageMetadata;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface EncryptedContent {
  data: string;
  nonce: string;
  algorithm: string;
  keyId: string;
  checksum: string;
}

export interface MessageMetadata {
  size?: number;
  duration?: number; // for audio/video
  fileName?: string;
  mimeType?: string;
  thumbnail?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  expiresAt?: number;
  editedAt?: number;
  replyTo?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string; // Only in development
}

// Security types
export interface SecurityCheck {
  id: string;
  timestamp: number;
  isSecure: boolean;
  score: number;
  issues: SecurityIssue[];
  recommendations: string[];
  duration: number;
}

export interface SecurityIssue {
  type: 'device' | 'network' | 'application' | 'environment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  autoFixable: boolean;
}

export interface ThreatAnalysis {
  id: string;
  timestamp: number;
  level: number; // 0-10
  confidence: number; // 0-100
  threats: DetectedThreat[];
  mitigations: string[];
  factors: ThreatFactors;
  lastScan: number;
}

export interface DetectedThreat {
  type: 'network' | 'behavioral' | 'device' | 'external';
  severity: number; // 0-10
  description: string;
  indicators: string[];
  mitigation: string;
}

export interface ThreatFactors {
  networkAnomaly: number;
  behaviorPattern: number;
  deviceIntegrity: number;
  timeBasedThreats: number;
}

// File types
export interface SecureFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  mimeType: string;
  uploadedAt: number;
  uploadedBy: string;
  encryptionLevel: 'standard' | 'enhanced' | 'military';
  accessLevel: 'private' | 'group' | 'public';
  downloadCount: number;
  expiresAt?: number;
  thumbnail?: string;
  preview?: string;
  isEncrypted: boolean;
  checksum: string;
  permissions: FilePermissions;
  sharedWith: string[];
  tags: string[];
  metadata: FileMetadata;
}

export type FileType = 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';

export interface FilePermissions {
  canDownload: boolean;
  canShare: boolean;
  canDelete: boolean;
  canView: boolean;
  canEdit: boolean;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  codec?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  camera?: {
    make: string;
    model: string;
    settings: Record<string, any>;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Event types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: number;
  source: 'user' | 'system' | 'network';
}

export interface SecurityEvent extends AppEvent {
  type: 'security.threat_detected' | 'security.scan_completed' | 'security.emergency_activated';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MessageEvent extends AppEvent {
  type: 'message.sent' | 'message.received' | 'message.read' | 'message.deleted';
  messageId: string;
  conversationId: string;
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  security: {
    encryptionAlgorithm: string;
    keyRotationInterval: number;
    sessionTimeout: number;
  };
  features: {
    aiThreatDetection: boolean;
    meshNetworking: boolean;
    biometricAuth: boolean;
    emergencyMode: boolean;
  };
  performance: {
    cacheSize: number;
    maxConcurrentRequests: number;
    animationDuration: number;
  };
}

// Error types
export class SecuriCommError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'SecuriCommError';
  }
}

export class EncryptionError extends SecuriCommError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'ENCRYPTION_ERROR', 'high', context);
    this.name = 'EncryptionError';
  }
}

export class AuthenticationError extends SecuriCommError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 'high', context);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends SecuriCommError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 'medium', context);
    this.name = 'NetworkError';
  }
}