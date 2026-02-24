// UPDATED FILE: client/src/services/authService.ts

import { apiClient } from "./api";
import type { LoginCredentials, SignupData, AuthResponse } from "../types";

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const payload = {
      userEmail: credentials.userEmail,
      password: credentials.password,
    };
    return apiClient.post<AuthResponse>("/auth/login", payload);
  },

  signup: async (userData: SignupData): Promise<AuthResponse> => {
    const payload = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      userEmail: userData.userEmail,
      password: userData.password,
      tenantName: userData.tenantName,
      role: "user",
    };
    return apiClient.post<AuthResponse>("/auth/register", payload);
  },

  logout: async (refreshToken?: string): Promise<void> => {
    return apiClient.post<void>("/auth/logout", { refreshToken });
  },

  refreshToken: async (
    refreshToken: string,
  ): Promise<{ token: string; refreshToken: string }> => {
    return apiClient.post<{ token: string; refreshToken: string }>(
      "/auth/refresh",
      { refreshToken },
    );
  },
  
  requestPasswordResetOTP: async (
    email: string,
  ): Promise<{ message: string; expiresIn: number }> => {
    return apiClient.post<{ message: string; expiresIn: number }>(
      "/auth/forgot-password",
      { email },
    );
  },

  verifyPasswordResetOTP: async (
    email: string,
    otp: string,
  ): Promise<{ message: string; resetToken: string; expiresIn: number }> => {
    return apiClient.post<{
      message: string;
      resetToken: string;
      expiresIn: number;
    }>("/auth/verify-otp", { email, otp });
  },

  resetPassword: async (
    resetToken: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/reset-password", {
      resetToken,
      newPassword,
    });
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/verify-email", { token });
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/resend-verification", {
      email,
    });
  },

  getStatus: async (): Promise<{ valid: boolean; user?: unknown }> => {
    return apiClient.get<{ valid: boolean; user?: unknown }>("/auth/status");
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/change-password", {
      oldPassword,
      newPassword,
    });
  },
};

export default authService;
