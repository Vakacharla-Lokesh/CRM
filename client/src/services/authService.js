import apiClient from './api';

/**
 * Authentication Service
 * API endpoints for authentication operations
 */

const authService = {
  /**
   * Login user
   */
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  /**
   * Signup new user
   */
  signup: async (userData) => {
    return apiClient.post('/auth/signup', userData);
  },

  /**
   * Logout user
   */
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async () => {
    return apiClient.post('/auth/refresh');
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    return apiClient.post('/auth/password-reset-request', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    return apiClient.post('/auth/password-reset', { token, newPassword });
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token) => {
    return apiClient.post('/auth/verify-email', { token });
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email) => {
    return apiClient.post('/auth/resend-verification', { email });
  },

  /**
   * Check authentication status
   */
  getStatus: async () => {
    return apiClient.get('/auth/status');
  },

  /**
   * Change password (authenticated)
   */
  changePassword: async (oldPassword, newPassword) => {
    return apiClient.post('/auth/change-password', { oldPassword, newPassword });
  },

  /**
   * Enable two-factor authentication
   */
  enableTwoFactor: async () => {
    return apiClient.post('/auth/2fa/enable');
  },

  /**
   * Disable two-factor authentication
   */
  disableTwoFactor: async (code) => {
    return apiClient.post('/auth/2fa/disable', { code });
  },

  /**
   * Verify two-factor code
   */
  verifyTwoFactor: async (code) => {
    return apiClient.post('/auth/2fa/verify', { code });
  },
};

export default authService;
