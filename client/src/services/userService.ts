import { apiClient } from "./api";
import type { User, UserStatistics } from "../types";

interface PasswordData {
  oldPassword?: string;
  newPassword: string;
}

interface ProfileData {
  name?: string;
  firstName?: string;
  lastName?: string;
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

export interface CursorUserPage {
  users: User[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export const userService = {
  getAllUsers: async (params?: {
    cursor?: string | null;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<CursorUserPage> => {
    const queryParams: Record<string, unknown> = { limit: params?.limit ?? 20 };
    if (params?.cursor) queryParams.cursor = params.cursor;
    if (params?.role) queryParams.role = params.role;
    if (params?.status) queryParams.status = params.status;
    if (params?.search) queryParams.search = params.search;

    const response = await apiClient.get<{
      count: number;
      users: User[];
      nextCursor: string | null;
      hasNextPage: boolean;
    }>("/users", queryParams);

    return {
      users: response.users,
      nextCursor: response.nextCursor,
      hasNextPage: response.hasNextPage,
    };
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<{ user: User }>(`/users/${id}`);
    return response.user;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>("/users/me");
    return response.user;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.post<{ message: string; user: User }>(
      "/users",
      userData,
    );
    return response.user;
  },

  updateUser: async (
    id: string,
    updates: Partial<User>,
    lastKnownUpdatedAt?: Date,
  ): Promise<User> => {
    const {
      firstName,
      lastName,
      email,
      mobile,
      role,
      tenantId,
      permissions,
    } = updates;

    const body: Record<string, unknown> = {};
    if (firstName !== undefined) body.firstName = firstName;
    if (lastName !== undefined) body.lastName = lastName;
    if (email !== undefined) body.email = email;
    if (mobile !== undefined) body.mobile = mobile;
    if (role !== undefined) body.role = role;
    if (tenantId !== undefined) body.tenantId = tenantId;
    if (permissions !== undefined) body.permissions = permissions;
    if (lastKnownUpdatedAt) body.lastKnownUpdatedAt = lastKnownUpdatedAt;

    const response = await apiClient.put<{ message: string; user: User }>(
      `/users/${id}`,
      body,
    );
    return response.user;
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${id}`);
  },

  searchUsers: async (query: string): Promise<User[]> => {
    return apiClient.get<User[]>(
      `/users/search?q=${encodeURIComponent(query)}`,
    );
  },

  getUsersByRole: async (role: string): Promise<User[]> => {
    return apiClient.get<User[]>(`/users?role=${encodeURIComponent(role)}`);
  },

  getUsersByTenant: async (tenantId: string): Promise<User[]> => {
    const response = await apiClient.get<{ count: number; users: User[] }>(
      `/users/tenant/${encodeURIComponent(tenantId)}`,
    );
    return response.users;
  },

  getUserStats: async (): Promise<UserStatistics> => {
    return apiClient.get<UserStatistics>("/users/stats");
  },

  updatePassword: async (
    id: string,
    passwordData: PasswordData,
  ): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>(
      `/users/${id}/password`,
      passwordData,
    );
  },

  updateRole: async (id: string, role: string): Promise<User> => {
    const response = await apiClient.patch<{ message: string; user: User }>(
      `/users/${id}/role`,
      { role },
    );
    return response.user;
  },

  sendPasswordReset: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/users/password-reset", {
      email,
    });
  },

  updateProfile: async (
    id: string,
    profileData: ProfileData,
  ): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/profile`, profileData);
  },

  getUserActivity: async (id: string): Promise<UserActivity[]> => {
    return apiClient.get<UserActivity[]>(`/users/${id}/activity`);
  },

  getUserPermissions: async (id: string): Promise<string[]> => {
    return apiClient.get<string[]>(`/users/${id}/permissions`);
  },
};

export default userService;
