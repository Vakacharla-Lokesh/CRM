import apiClient from './api';
import type { User, UserStatistics } from '../types';

/**
 * User Service
 * API endpoints for user operations
 */

interface PasswordData {
  oldPassword?: string;
  newPassword: string;
}

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
}

interface UserActivity {
  id: string;
  userId: string;
  type: string;
  description: string;
  timestamp: string;
}

const userService = {
  /**
   * Get all users
   */
  getAllUsers: async (): Promise<User[]> => {
    return apiClient.get<User[]>('/users');
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/users/me');
  },

  /**
   * Create new user
   */
  createUser: async (userData: Partial<User>): Promise<User> => {
    return apiClient.post<User>('/users', userData);
  },

  /**
   * Update user
   */
  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, updates);
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${id}`);
  },

  /**
   * Search users
   */
  searchUsers: async (query: string): Promise<User[]> => {
    return apiClient.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get users by role
   */
  getUsersByRole: async (role: string): Promise<User[]> => {
    return apiClient.get<User[]>(`/users?role=${encodeURIComponent(role)}`);
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<UserStatistics> => {
    return apiClient.get<UserStatistics>('/users/stats');
  },

  /**
   * Update user password
   */
  updatePassword: async (id: string, passwordData: PasswordData): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>(`/users/${id}/password`, passwordData);
  },

  /**
   * Update user role
   */
  updateRole: async (id: string, role: string): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/role`, { role });
  },

  /**
   * Activate user
   */
  activateUser: async (id: string): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/activate`);
  },

  /**
   * Deactivate user
   */
  deactivateUser: async (id: string): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/deactivate`);
  },

  /**
   * Bulk update users
   */
  bulkUpdateUsers: async (userIds: string[], updates: Partial<User>): Promise<{ message: string; updated: number }> => {
    return apiClient.post<{ message: string; updated: number }>('/users/bulk-update', { userIds, updates });
  },

  /**
   * Send password reset email
   */
  sendPasswordReset: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/users/password-reset', { email });
  },

  /**
   * Update user profile
   */
  updateProfile: async (id: string, profileData: ProfileData): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/profile`, profileData);
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (id: string, file: File | Blob): Promise<{ message: string; avatarUrl: string }> => {
    return apiClient.upload<{ message: string; avatarUrl: string }>(`/users/${id}/avatar`, file);
  },

  /**
   * Get user activity log
   */
  getUserActivity: async (id: string): Promise<UserActivity[]> => {
    return apiClient.get<UserActivity[]>(`/users/${id}/activity`);
  },

  /**
   * Get user permissions
   */
  getUserPermissions: async (id: string): Promise<string[]> => {
    return apiClient.get<string[]>(`/users/${id}/permissions`);
  },

  /**
   * Update user permissions
   */
  updatePermissions: async (id: string, permissions: string[]): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>(`/users/${id}/permissions`, { permissions });
  },
};

export default userService;
