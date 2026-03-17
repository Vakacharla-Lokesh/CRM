import { apiClient } from "./api";
import type { LoginCredentials, SignupData, AuthResponse } from "../types";

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
  },

  signup: async (userData: SignupData): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/register", {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: "user",
    });
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>("/auth/logout", {});
  },

  refreshSession: async (): Promise<void> => {
    return apiClient.post<void>("/auth/refresh", {});
  },

  getProfile: async (): Promise<AuthResponse> => {
    return apiClient.get<AuthResponse>("/auth/profile");
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
