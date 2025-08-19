/**
 * User API Service
 */

import { apiClient } from '../lib/api-client';
import { 
  User, 
  UpdateUserDto, 
  UserSettings, 
  UpdateSettingsDto, 
  UsageStats 
} from '../types/user.types';

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/users/me');
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserDto): Promise<User> {
    return apiClient.patch<User>('/users/me', { body: data });
  },

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    return apiClient.delete<void>('/users/me');
  }
};