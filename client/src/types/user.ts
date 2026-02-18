/**
 * User Model Types
 */

export interface User {
  _id: string;
  userId: string; // custom ID for backward compatibility
  userName: string;
  userEmail: string;
  userPhone?: string;
  userRole: UserRole;
  tenantId: string;
  organizationId: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  userName: string;
  userEmail: string;
  userPassword: string;
  userPhone?: string;
  userRole?: UserRole;
  organizationId: string;
}

export interface UpdateUserDTO {
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userRole?: UserRole;
  isActive?: boolean;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export type UserRole = "admin" | "user" | "viewer" | "manager";

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
    admin: {
      canCreateLead: true,
      canEditLead: true,
      canDeleteLead: true,
      canViewAllLeads: true,
      canManageUsers: true,
      canManageOrganization: true,
      canExportData: true,
      canAccessAnalytics: true,
    },
    manager: {
      canCreateLead: true,
      canEditLead: true,
      canDeleteLead: false,
      canViewAllLeads: true,
      canManageUsers: false,
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
    viewer: {
      canCreateLead: false,
      canEditLead: false,
      canDeleteLead: false,
      canViewAllLeads: true,
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
