import { apiClient } from "./core";
import type {
  Role,
  CreateRoleDTO,
  UpdateRoleDTO,
  RoleResponse,
  RolesResponse,
  PermissionsResponse,
} from "../../types/role";

export const rolesApi = {
  /**
   * Get all roles for the current user's tenant
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<RolesResponse>("/roles");
    return response.data;
  },

  /**
   * Get a single role by ID
   */
  getRole: async (roleId: string): Promise<Role> => {
    const response = await apiClient.get<RoleResponse>(`/roles/${roleId}`);
    return response.data;
  },

  /**
   * Get permissions for a specific role
   */
  getPermissions: async (roleId: string): Promise<string[]> => {
    const response = await apiClient.get<PermissionsResponse>(
      `/roles/${roleId}/permissions`,
    );
    return response.data.permissions;
  },

  /**
   * Create a new role (admin only)
   */
  createRole: async (role: CreateRoleDTO): Promise<Role> => {
    const response = await apiClient.post<RoleResponse>("/roles", role);
    return response.data;
  },

  /**
   * Update an existing role (admin only)
   */
  updateRole: async (roleId: string, updates: UpdateRoleDTO): Promise<Role> => {
    const response = await apiClient.put<RoleResponse>(
      `/roles/${roleId}`,
      updates,
    );
    return response.data;
  },

  /**
   * Delete a role (admin only)
   */
  deleteRole: async (roleId: string): Promise<void> => {
    await apiClient.delete(`/roles/${roleId}`);
  },
};
