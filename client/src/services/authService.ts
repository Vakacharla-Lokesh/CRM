import { apiClient } from './api';
import type { LoginCredentials, SignupData, AuthResponse } from '../types';

/**
 * Authentication Service
 * API endpoints for authentication operations
 */

const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Map client field names to server field names
    const payload = {
      userEmail: credentials.userEmail,
      password: credentials.userPassword, // Server expects 'password' not 'userPassword'
    };
    return apiClient.post<AuthResponse>('/auth/login', payload);
  },

  /**
   * Signup new user
   */
  signup: async (userData: SignupData): Promise<AuthResponse> => {
    // Map client field names to server field names
    const payload = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      userEmail: userData.userEmail,
      password: userData.userPassword, // Server expects 'password' not 'userPassword'
      tenantName: userData.tenantName,
      role: 'user', // Default role for new signups
    };
    return apiClient.post<AuthResponse>('/auth/register', payload);
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<{ token: string }> => {
    return apiClient.post<{ token: string }>('/auth/refresh');
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/password-reset-request', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/password-reset', { token, newPassword });
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/verify-email', { token });
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/resend-verification', { email });
  },

  /**
   * Check authentication status
   */
  getStatus: async (): Promise<{ valid: boolean; user?: unknown }> => {
    return apiClient.get<{ valid: boolean; user?: unknown }>('/auth/status');
  },

  /**
   * Change password (authenticated)
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/change-password', { oldPassword, newPassword });
  },

  /**
   * Enable two-factor authentication
   */
  enableTwoFactor: async (): Promise<{ qrCode: string; secret: string }> => {
    return apiClient.post<{ qrCode: string; secret: string }>('/auth/2fa/enable');
  },

  /**
   * Disable two-factor authentication
   */
  disableTwoFactor: async (code: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/2fa/disable', { code });
  },

  /**
   * Verify two-factor code
   */
  verifyTwoFactor: async (code: string): Promise<{ valid: boolean }> => {
    return apiClient.post<{ valid: boolean }>('/auth/2fa/verify', { code });
  },
};

export default authService;
