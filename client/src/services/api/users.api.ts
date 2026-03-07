import { get, post, put, patch, delete_ } from "./core";
import type {
  User,
  UserListResponse,
  CreateUserDTO,
  UpdateUserDTO,
  LeadListResponse,
} from "../../types";

export const usersAPI = {
  list: async (params?: { page?: number; limit?: number; role?: string }) => {
    const response = await get<{ count: number; users: User[] }>(
      "/users",
      params,
    );
    return {
      users: response.users,
      total: response.count,
      page: params?.page || 1,
      limit: params?.limit || response.count,
    } as UserListResponse;
  },

  get: async (id: string) => {
    const response = await get<{ user: User }>(`/users/${id}`);
    return response.user;
  },

  create: async (data: CreateUserDTO) => {
    const response = await post<{ message: string; user: User }>(
      "/users",
      data,
    );
    return response.user;
  },

  update: async (id: string, data: UpdateUserDTO, lastKnownUpdatedAt?: Date) => {
    const response = await put<{ message: string; user: User }>(
      `/users/${id}`,
      {
        ...data,
        ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }),
      },
    );
    return response.user;
  },

  delete: (id: string) => delete_<void>(`/users/${id}`),

  getMe: () => get<User>("/users/me", {}),

  updatePassword: (currentPassword: string, newPassword: string) =>
    put<void>("/users/password", { currentPassword, newPassword }),

  getAssignedLeads: (
    userId: string,
    params?: { page?: number; limit?: number },
  ) => get<LeadListResponse>(`/users/${userId}/leads`, params),

  assignRole: async (userId: string, roleId: string) => {
    const response = await patch<{ message: string; user: User }>(
      `/users/${userId}/role`,
      { roleId },
    );
    return response.user;
  },

  getPermissions: (userId: string) =>
    get<{ permissions: string[] }>(`/users/${userId}/permissions`),
};
