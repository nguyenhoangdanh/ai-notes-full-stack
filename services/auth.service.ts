/**
 * Authentication API Service
 */

import { apiClient } from '../lib/api-client';
import { 
  AuthResponseDto, 
  LoginDto, 
  RegisterDto, 
  TokenVerificationResponse, 
  User,
  UserSettings,
  UpdateSettingsDto,
  Usage
} from '../types/auth.types';

export const authService = {
  /**
   * Register a new user with email and password
   */
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    return await apiClient.post<AuthResponseDto>('/auth/register', { body: data });
  },

  /**
   * Login with email and password
   */
  async login(data: LoginDto): Promise<AuthResponseDto> {
    return await apiClient.post<AuthResponseDto>('/auth/login', { body: data });
  },

   /**
   * Initiate Google OAuth login
   */
  async googleLogin(): Promise<void> {
    // This will redirect to Google OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'}/auth/google`;
  },

  /**
   * Verify current JWT token
   */
  async verifyToken(): Promise<TokenVerificationResponse> {
    return await apiClient.get<TokenVerificationResponse>('/auth/verify');
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return await apiClient.get<User>('/auth/me');
  },

  /**
   * Verify current JWT token
   */
  async verify(): Promise<TokenVerificationResponse> {
    return await apiClient.get<TokenVerificationResponse>('/auth/verify');
  },

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    return await apiClient.get<UserSettings>('/settings');
  },

  /**
   * Update user settings
   */
  async updateSettings(data: UpdateSettingsDto): Promise<UserSettings> {
    return await apiClient.patch<UserSettings>('/settings', { body: data });
  },

  /**
   * Reset user settings to defaults
   */
  async resetSettings(): Promise<UserSettings> {
    return await apiClient.patch<UserSettings>('/settings', { body: { model: 'gemini-1.5-flash', maxTokens: 4000, autoReembed: true } });
  },

  /**
   * Get usage statistics
   */
  async getUsage(days: number = 30): Promise<Usage[]> {
    return await apiClient.get<Usage[]>('/settings/usage', { query: { days: days.toString() } });
  },

  /**
   * Logout user (clears server-side cookie)
   */
  async logout(): Promise<{ message: string }> {
    return await apiClient.post('/auth/logout');
  },

  /**
   * Demo login (no server request needed)
   */
  async demoLogin(): Promise<AuthResponseDto> {
    // Return a mock auth response for demo mode
    return Promise.resolve({
      access_token: 'demo-token',
      user: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        image: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
  }
};