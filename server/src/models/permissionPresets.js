export const PERMISSION_MAP = {
  // Lead Management
  LEADS: [
    "leads:read",
    "leads:write",
    "leads:delete",
    "leads:export",
    "leads:assign",
    "leads:view_all",
  ],

  // Deal Management
  DEALS: [
    "deals:read",
    "deals:write",
    "deals:delete",
    "deals:export",
    "deals:view_all",
  ],

  // User Management
  USERS: [
    "users:read",
    "users:write",
    "users:delete",
    "users:manage_roles",
    "users:view_all",
  ],

  // Organization Management
  ORGANIZATIONS: [
    "organizations:read",
    "organizations:write",
    "organizations:delete",
    "organizations:export",
    "organizations:view_all",
  ],

  // Role Management
  ROLES: ["roles:read", "roles:write", "roles:delete"],

  // Tenant Management (super_admin only)
  TENANTS: ["tenants:read", "tenants:write", "tenants:delete"],

  // Analytics & Reporting
  ANALYTICS: ["analytics:read", "analytics:export", "analytics:view_all"],

  // Call Management
  CALLS: ["calls:read", "calls:write", "calls:delete"],

  // Comment Management
  COMMENTS: ["comments:read", "comments:write", "comments:delete"],

  // Attachment Management
  ATTACHMENTS: ["attachments:read", "attachments:write", "attachments:delete"],

  // Bulk Operations
  BULK: ["bulk:import", "bulk:export", "bulk:delete"],

  // Settings
  SETTINGS: ["settings:read", "settings:write", "workflows:view_all"],

  // Task Management
  TASKS: ["tasks:read", "tasks:write", "tasks:delete", "tasks:view_all"],

  // System-wide access (super_admin / global tenant only)
  SYSTEM: ["system:manage"],
};

// Flatten all permissions into single array
export const ALL_PERMISSIONS = Object.values(PERMISSION_MAP).flat();

// Role presets for migration
export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: ALL_PERMISSIONS,

  admin: [
    ...PERMISSION_MAP.LEADS,
    ...PERMISSION_MAP.DEALS,
    ...PERMISSION_MAP.ORGANIZATIONS,
    ...PERMISSION_MAP.CALLS,
    ...PERMISSION_MAP.COMMENTS,
    ...PERMISSION_MAP.ATTACHMENTS,
    ...PERMISSION_MAP.TASKS,
    "users:read",
    "users:write",
    "users:view_all",
    "analytics:read",
    "analytics:export",
    "analytics:view_all",
    "bulk:import",
    "bulk:export",
    "settings:read",
    "workflows:view_all",
  ],

  user: [
    "leads:read",
    "leads:write",
    "deals:read",
    "deals:write",
    "organizations:read",
    "calls:read",
    "calls:write",
    "comments:read",
    "comments:write",
    "attachments:read",
    "attachments:write",
    "analytics:read",
    "tasks:read",
    "tasks:write",
  ],
};

// Helper: check if permission exists
export const isValidPermission = (permission) => {
  return ALL_PERMISSIONS.includes(permission);
};

// Helper: get permissions for legacy role
export const getLegacyRolePermissions = (roleName) => {
  return DEFAULT_ROLE_PERMISSIONS[roleName] || [];
};
