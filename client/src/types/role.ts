export interface Role {
  _id: string;
  tenantId: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface RoleResponse {
  success: boolean;
  data: Role;
  message?: string;
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  count?: number;
}

export interface PermissionsResponse {
  success: boolean;
  data: {
    permissions: string[];
  };
}
