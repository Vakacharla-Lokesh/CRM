export const PERMISSION_MAP: Record<string, string[]> = {
  Leads: [
    "leads:read",
    "leads:write",
    "leads:delete",
    "leads:export",
    "leads:assign",
    "leads:view_all",
  ],
  Deals: [
    "deals:read",
    "deals:write",
    "deals:delete",
    "deals:export",
    "deals:view_all",
  ],
  Users: [
    "users:read",
    "users:write",
    "users:delete",
    "users:manage_roles",
    "users:view_all",
  ],
  Organizations: [
    "organizations:read",
    "organizations:write",
    "organizations:delete",
    "organizations:export",
    "organizations:view_all",
  ],
  Roles: ["roles:read", "roles:write", "roles:delete"],
  Tenants: ["tenants:read", "tenants:write", "tenants:delete"],
  Analytics: ["analytics:read", "analytics:export", "analytics:view_all"],
  Calls: ["calls:read", "calls:write", "calls:delete"],
  Comments: ["comments:read", "comments:write", "comments:delete"],
  Attachments: ["attachments:read", "attachments:write", "attachments:delete"],
  Bulk: ["bulk:import", "bulk:export", "bulk:delete"],
  Settings: ["settings:read", "settings:write"],
  Tasks: ["tasks:read", "tasks:write", "tasks:delete", "tasks:view_all"],
  Pipelines: ["pipelines:read", "pipelines:write", "pipelines:delete"],
};

export const ALL_PERMISSIONS: string[] = Object.values(PERMISSION_MAP).flat();

export const permissionLabel = (permission: string): string => {
  const action = permission.split(":")[1] ?? permission;
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};
