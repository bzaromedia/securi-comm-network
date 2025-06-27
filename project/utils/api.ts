/**
 * SecuriComm API Service
 * 
 * Provides API functionality for communication with the backend.
 * Handles authentication, request/response formatting, and error handling.
 */

import { secureStorage, StorageKeys } from './storage';

// API base URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.securicomm.app';

// API response interface
export interface ApiResponse<T = any> {
  success: boolean; 
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// API options interface
export interface ApiOptions {
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  timeout?: number;
}

// API service
class ApiService {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Set base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
  
  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string | null> {
    return await secureStorage.getItem(StorageKeys.AUTH_TOKEN);
  }
  
  /**
   * Get request headers
   */
  private async getHeaders(
    requiresAuth: boolean,
    additionalHeaders: Record<string, string> = {}
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...additionalHeaders,
    };
    
    if (requiresAuth) {
      const token = await this.getAuthToken();
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }
  
  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const contentType = response.headers.get('content-type');
      
      // Check if response is JSON
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        // Check if response is successful
        if (response.ok) {
          return {
            success: true,
            data: data.data || data,
            message: data.message,
            statusCode: response.status,
          };
        }
        
        // Handle error response
        return {
          success: false,
          error: data.error || data.message || 'Unknown error',
          message: data.message,
          statusCode: response.status,
        };
      }
      
      // Handle non-JSON response
      const text = await response.text();
      
      if (response.ok) {
        return {
          success: true,
          data: text as unknown as T,
          statusCode: response.status,
        };
      }
      
      return {
        success: false,
        error: text || 'Unknown error',
        statusCode: response.status,
      };
    } catch (error) {
      console.error('Handle response error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: response.status,
      };
    }
  }
  
  /**
   * Handle API error
   */
  private handleError(error: any): ApiResponse {
    console.error('API error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
  
  /**
   * Make API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const requiresAuth = options.requiresAuth !== false;
      const headers = await this.getHeaders(requiresAuth, options.headers);
      
      const config: RequestInit = {
        method,
        headers,
      };
      
      // Add request body for non-GET requests
      if (method !== 'GET' && data) {
        config.body = JSON.stringify(data);
      }
      
      // Make request with timeout
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, options.timeout || 30000);
      });
      
      const fetchPromise = fetch(url, config);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return await this.request<T>('GET', endpoint, undefined, options);
  }
  
  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return await this.request<T>('POST', endpoint, data, options);
  }
  
  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return await this.request<T>('PUT', endpoint, data, options);
  }
  
  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return await this.request<T>('PATCH', endpoint, data, options);
  }
  
  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return await this.request<T>('DELETE', endpoint, undefined, options);
  }
}

// Create API service instance
const apiService = new ApiService(API_BASE_URL);

// Auth API
const auth = {
  /**
   * Register user
   */
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<ApiResponse> {
    return await apiService.post('/auth/register', {
      email,
      password,
      displayName,
    });
  },
  
  /**
   * Login user
   */
  async login(email: string, password: string): Promise<ApiResponse> {
    return await apiService.post('/auth/login', {
      email,
      password,
    });
  },
  
  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse> {
    return await apiService.post('/auth/logout');
  },
  
  /**
   * Refresh token
   */
  async refreshToken(): Promise<ApiResponse> {
    return await apiService.post('/auth/refresh');
  },
  
  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse> {
    return await apiService.get('/auth/me');
  },
  
  /**
   * Update user profile
   */
  async updateProfile(data: any): Promise<ApiResponse> {
    return await apiService.put('/auth/profile', data);
  },
  
  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    return await apiService.put('/auth/password', {
      currentPassword,
      newPassword,
    });
  },
  
  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    return await apiService.post('/auth/password/reset', {
      email,
    });
  },
  
  /**
   * Reset password
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse> {
    return await apiService.post('/auth/password/reset/confirm', {
      token,
      newPassword,
    });
  },
  
  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<ApiResponse> {
    return await apiService.post('/auth/email/verify', {
      token,
    });
  },
};

// Conversations API
const conversations = {
  /**
   * Get all conversations
   */
  async getAll(): Promise<ApiResponse> {
    return await apiService.get('/conversations');
  },
  
  /**
   * Get conversation by ID
   */
  async getById(id: string): Promise<ApiResponse> {
    return await apiService.get(`/conversations/${id}`);
  },
  
  /**
   * Create direct conversation
   */
  async createDirect(recipientEmail: string): Promise<ApiResponse> {
    return await apiService.post('/conversations/direct', {
      recipientEmail,
    });
  },
  
  /**
   * Create group conversation
   */
  async createGroup(
    name: string,
    participantEmails: string[],
    encryptionKey?: string
  ): Promise<ApiResponse> {
    return await apiService.post('/conversations/group', {
      name,
      participantEmails,
      encryptionKey,
    });
  },
  
  /**
   * Update conversation
   */
  async update(id: string, data: any): Promise<ApiResponse> {
    return await apiService.put(`/conversations/${id}`, data);
  },
  
  /**
   * Delete conversation
   */
  async delete(id: string): Promise<ApiResponse> {
    return await apiService.delete(`/conversations/${id}`);
  },
  
  /**
   * Add participants to conversation
   */
  async addParticipants(
    id: string,
    participantEmails: string[]
  ): Promise<ApiResponse> {
    return await apiService.post(`/conversations/${id}/participants`, {
      participantEmails,
    });
  },
  
  /**
   * Remove participant from conversation
   */
  async removeParticipant(
    id: string,
    participantId: string
  ): Promise<ApiResponse> {
    return await apiService.delete(
      `/conversations/${id}/participants/${participantId}`
    );
  },
  
  /**
   * Mark conversation as read
   */
  async markAsRead(id: string): Promise<ApiResponse> {
    return await apiService.post(`/conversations/${id}/read`);
  },
};

// Messages API
const messages = {
  /**
   * Get messages by conversation ID
   */
  async getByConversation(
    conversationId: string,
    limit: number = 20,
    before?: string
  ): Promise<ApiResponse> {
    let endpoint = `/messages?conversationId=${conversationId}&limit=${limit}`;
    
    if (before) {
      endpoint += `&before=${before}`;
    }
    
    return await apiService.get(endpoint);
  },
  
  /**
   * Send message
   */
  async send(
    conversationId: string,
    content: string,
    attachments: any[] = []
  ): Promise<ApiResponse> {
    return await apiService.post('/messages', {
      conversationId,
      content,
      attachments,
    });
  },
  
  /**
   * Update message
   */
  async update(id: string, content: string): Promise<ApiResponse> {
    return await apiService.put(`/messages/${id}`, {
      content,
    });
  },
  
  /**
   * Delete message
   */
  async delete(id: string): Promise<ApiResponse> {
    return await apiService.delete(`/messages/${id}`);
  },
  
  /**
   * Mark message as read
   */
  async markAsRead(id: string): Promise<ApiResponse> {
    return await apiService.post(`/messages/${id}/read`);
  },
};

// Contacts API
const contacts = {
  /**
   * Get all contacts
   */
  async getAll(): Promise<ApiResponse> {
    return await apiService.get('/contacts');
  },
  
  /**
   * Get contact by ID
   */
  async getById(id: string): Promise<ApiResponse> {
    return await apiService.get(`/contacts/${id}`);
  },
  
  /**
   * Add contact
   */
  async add(email: string): Promise<ApiResponse> {
    return await apiService.post('/contacts', {
      email,
    });
  },
  
  /**
   * Update contact
   */
  async update(id: string, data: any): Promise<ApiResponse> {
    return await apiService.put(`/contacts/${id}`, data);
  },
  
  /**
   * Delete contact
   */
  async delete(id: string): Promise<ApiResponse> {
    return await apiService.delete(`/contacts/${id}`);
  },
  
  /**
   * Block contact
   */
  async block(id: string): Promise<ApiResponse> {
    return await apiService.post(`/contacts/${id}/block`);
  },
  
  /**
   * Unblock contact
   */
  async unblock(id: string): Promise<ApiResponse> {
    return await apiService.post(`/contacts/${id}/unblock`);
  },
};

// Security API
const security = {
  /**
   * Get security status
   */
  async getStatus(): Promise<ApiResponse> {
    return await apiService.get('/security/status');
  },
  
  /**
   * Update security level
   */
  async updateLevel(level: string): Promise<ApiResponse> {
    return await apiService.put('/security/level', {
      level,
    });
  },
  
  /**
   * Get security logs
   */
  async getLogs(limit: number = 20, page: number = 1): Promise<ApiResponse> {
    return await apiService.get(
      `/security/logs?limit=${limit}&page=${page}`
    );
  },
  
  /**
   * Report security threat
   */
  async reportThreat(data: any): Promise<ApiResponse> {
    return await apiService.post('/security/threats', data);
  },
  
  /**
   * Get security threats
   */
  async getThreats(limit: number = 20, page: number = 1): Promise<ApiResponse> {
    return await apiService.get(
      `/security/threats?limit=${limit}&page=${page}`
    );
  },
  
  /**
   * Enable emergency mode
   */
  async enableEmergencyMode(): Promise<ApiResponse> {
    return await apiService.post('/security/emergency/enable');
  },
  
  /**
   * Disable emergency mode
   */
  async disableEmergencyMode(): Promise<ApiResponse> {
    return await apiService.post('/security/emergency/disable');
  },
};

// Export API service
export const api = {
  service: apiService,
  auth,
  conversations,
  messages,
  contacts,
  security,
};
