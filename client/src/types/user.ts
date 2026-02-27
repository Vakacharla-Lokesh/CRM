export interface User {
  _id: string;
  userId?: string;
  firstName: string;
  lastName?: string;
  userEmail: string;
  mobile?: string;
  role: UserRole;
  roleId?: string;
  roleName?: string;
  permissions: string[];
  tenantId: string;
  isActive?: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  firstName: string;
  lastName?: string;
  userEmail: string;
  password: string;
  mobile?: string;
  role?: UserRole;
  roleId?: string;
  tenantId: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  userEmail?: string;
  mobile?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

export type UserRole = "user" | "admin" | "super_admin";


export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj._id === "string" &&
    typeof obj.userEmail === "string" &&
    typeof obj.role === "string"
  );
}
