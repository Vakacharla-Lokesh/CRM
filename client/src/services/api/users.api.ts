import { get, post, put, delete_ } from "./core";
import type {
  User,
  UserListResponse,
  CreateUserDTO,
  UpdateUserDTO,
  LeadListResponse,
} from "../../types";

export const usersAPI = {
  list: (params?: { page?: number; limit?: number; role?: string }) =>
    get<UserListResponse>("/users", params),

  get: (id: string) => get<User>(`/users/${id}`),

  create: (data: CreateUserDTO) => post<User>("/users", data),

  update: (id: string, data: UpdateUserDTO) => put<User>(`/users/${id}`, data),

  delete: (id: string) => delete_<void>(`/users/${id}`),

  getMe: () => get<User>("/users/me", {}),

  updatePassword: (currentPassword: string, newPassword: string) =>
    put<void>("/users/password", { currentPassword, newPassword }),

  getAssignedLeads: (
    userId: string,
    params?: { page?: number; limit?: number },
  ) => get<LeadListResponse>(`/users/${userId}/leads`, params),
};
