import { get, post, put, delete_ } from "./core";
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

  update: async (id: string, data: UpdateUserDTO) => {
    const response = await put<{ message: string; user: User }>(
      `/users/${id}`,
      data,
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
};
