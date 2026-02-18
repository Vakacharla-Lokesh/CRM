import apiClient from './api';

/**
 * User Service
 * API endpoints for user operations
 */

const userService = {
  /**
   * Get all users
   */
  getAllUsers: async () => {
    return apiClient.get('/users');
  },

  /**
   * Get user by ID
   */
  getUserById: async (id) => {
    return apiClient.get(`/users/${id}`);
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    return apiClient.get('/users/me');
  },

  /**
   * Create new user
   */
  createUser: async (userData) => {
    return apiClient.post('/users', userData);
  },

  /**
   * Update user
   */
  updateUser: async (id, updates) => {
    return apiClient.put(`/users/${id}`, updates);
  },

  /**
   * Delete user
   */
  deleteUser: async (id) => {
    return apiClient.delete(`/users/${id}`);
  },

  /**
   * Search users
   */
  searchUsers: async (query) => {
    return apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get users by role
   */
  getUsersByRole: async (role) => {
    return apiClient.get(`/users?role=${encodeURIComponent(role)}`);
  },

  /**
   * Get user statistics
   */
  getUserStats: async () => {
    return apiClient.get('/users/stats');
  },

  /**
   * Update user password
   */
  updatePassword: async (id, passwordData) => {
    return apiClient.put(`/users/${id}/password`, passwordData);
  },

  /**
   * Update user role
   */
  updateRole: async (id, role) => {
    return apiClient.patch(`/users/${id}/role`, { role });
  },

  /**
   * Activate user
   */
  activateUser: async (id) => {
    return apiClient.patch(`/users/${id}/activate`);
  },

  /**
   * Deactivate user
   */
  deactivateUser: async (id) => {
    return apiClient.patch(`/users/${id}/deactivate`);
  },

  /**
   * Bulk update users
   */
  bulkUpdateUsers: async (userIds, updates) => {
    return apiClient.post('/users/bulk-update', { userIds, updates });
  },

  /**
   * Send password reset email
   */
  sendPasswordReset: async (email) => {
    return apiClient.post('/users/password-reset', { email });
  },

  /**
   * Update user profile
   */
  updateProfile: async (id, profileData) => {
    return apiClient.patch(`/users/${id}/profile`, profileData);
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (id, file) => {
    return apiClient.upload(`/users/${id}/avatar`, file);
  },

  /**
   * Get user activity log
   */
  getUserActivity: async (id) => {
    return apiClient.get(`/users/${id}/activity`);
  },

  /**
   * Get user permissions
   */
  getUserPermissions: async (id) => {
    return apiClient.get(`/users/${id}/permissions`);
  },

  /**
   * Update user permissions
   */
  updatePermissions: async (id, permissions) => {
    return apiClient.put(`/users/${id}/permissions`, { permissions });
  },
};

export default userService;
