/**
 * Authentication API Service
 */

import { apiClient } from '../lib/api-client';
import { 
  AuthResponseDto, 
  LoginDto, 
  RegisterDto, 
  TokenVerificationResponse, 
  User 
} from '../types/auth.types';

export const authService = {
  /**
   * Register a new user with email and password
   */
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    return apiClient.post<AuthResponseDto>('/auth/register', { body: data });
  },

  /**
   * Login with email and password
   */
  async login(data: LoginDto): Promise<AuthResponseDto> {
    return apiClient.post<AuthResponseDto>('/auth/login', { body: data });
  },

  /**
   * Initiate Google OAuth login
   */
  async googleLogin(): Promise<void> {
    // This will redirect to Google OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/google`;
  },

  /**
   * Verify current JWT token
   */
  async verifyToken(): Promise<TokenVerificationResponse> {
    return apiClient.get<TokenVerificationResponse>('/auth/verify');
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Verify current JWT token
   */
  async verify(): Promise<TokenVerificationResponse> {
    return apiClient.get<TokenVerificationResponse>('/auth/verify');
  },

  /**
   * Get user settings
   */
  async getSettings(): Promise<any> {
    return apiClient.get('/settings');
  },

  /**
   * Update user settings
   */
  async updateSettings(data: any): Promise<any> {
    return apiClient.patch('/settings', { body: data });
  },

  /**
   * Reset user settings to defaults
   */
  async resetSettings(): Promise<any> {
    return apiClient.patch('/settings', { body: { model: 'gemini-1.5-flash', maxTokens: 4000, autoReembed: true } });
  },

  /**
   * Get usage statistics
   */
  async getUsage(days: number = 30): Promise<any> {
    return apiClient.get('/settings/usage', { query: { days: days.toString() } });
  },

  /**
   * Logout user (clears server-side cookie)
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post('/auth/logout');
  }
};