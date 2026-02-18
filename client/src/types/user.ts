export interface User {
  _id: string;
  userId?: string; // Alias for _id
  firstName: string;
  lastName?: string;
  userEmail: string;
  mobile?: string;
  role: UserRole;
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
  userPassword: string;
  mobile?: string;
  role?: UserRole;
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

export interface UserPermissions {
  canCreateLead: boolean;
  canEditLead: boolean;
  canDeleteLead: boolean;
  canViewAllLeads: boolean;
  canManageUsers: boolean;
  canManageOrganization: boolean;
  canExportData: boolean;
  canAccessAnalytics: boolean;
}

export function getRolePermissions(role: UserRole): UserPermissions {
  const permissions: Record<UserRole, UserPermissions> = {
    super_admin: {
      canCreateLead: true,
      canEditLead: true,
      canDeleteLead: true,
      canViewAllLeads: true,
      canManageUsers: true,
      canManageOrganization: true,
      canExportData: true,
      canAccessAnalytics: true,
    },
    admin: {
      canCreateLead: true,
      canEditLead: true,
      canDeleteLead: true,
      canViewAllLeads: true,
      canManageUsers: true,
      canManageOrganization: false,
      canExportData: true,
      canAccessAnalytics: true,
    },
    user: {
      canCreateLead: true,
      canEditLead: true,
      canDeleteLead: false,
      canViewAllLeads: false,
      canManageUsers: false,
      canManageOrganization: false,
      canExportData: false,
      canAccessAnalytics: true,
    },
  };
  return permissions[role];
}

export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj._id === "string" &&
    typeof obj.userEmail === "string" &&
    typeof obj.userRole === "string"
  );
}
