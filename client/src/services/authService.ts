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

  logout: async (): Promise<void> => {
    return apiClient.post<void>("/auth/logout");
  },

  refreshToken: async (): Promise<{ token: string }> => {
    return apiClient.post<{ token: string }>("/auth/refresh");
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/password-reset-request", {
      email,
    });
  },

  resetPassword: async (
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/password-reset", {
      token,
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
