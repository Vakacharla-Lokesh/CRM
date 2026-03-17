/**
 * authCleanup.js
 *
 * Audit trail documenting the legacy auth refactor performed as part of
 * the Dynamic RBAC migration. This file records every location where
 * legacy inline role checks were removed or replaced and what they were
 * replaced with.
 *
 * This file is informational only and is NOT imported at runtime.
 */

export const LEGACY_ROLE_CHECKS_REMOVED = [
  // ─────────────────────────────────────────────────────────────
  // middlewares/rbac.js
  // ─────────────────────────────────────────────────────────────
  {
    file: "server/src/middlewares/rbac.js",
    change: "Renamed export `authorize` → `requirePermission`.",
    reason:
      "Unified naming: all route-level permission guards use the same function name.",
    removedExport: "authorizeLegacy",
    removedReason:
      "Unused in all route files; legacy role-string enforcement is now handled by the ROLE_NAMES short-circuit inside requirePermission.",
  },

  // ─────────────────────────────────────────────────────────────
  // controllers/workflowController.js
  // ─────────────────────────────────────────────────────────────
  {
    file: "server/src/controllers/workflowController.js",
    location: "getWorkflowById, updateWorkflow, deleteWorkflow, toggleWorkflow, getWorkflowLogs",
    removed: "if (req.user.role !== 'super_admin' && workflow.tenantId !== req.user.tenantId)",
    replacedWith: "if (req.tenantFilter.tenantId && workflow.tenantId !== req.tenantFilter.tenantId)",
    reason:
      "req.tenantFilter is injected by injectTenantFilter middleware (now applied router-wide). " +
      "super_admin gets req.tenantFilter = {}, so tenantId check is skipped automatically.",
  },
  {
    file: "server/src/controllers/workflowController.js",
    location: "createWorkflow",
    removed: "if (req.user.role !== 'super_admin') { workflowData.tenantId = req.user.tenantId; }",
    replacedWith: "if (req.tenantFilter.tenantId) { workflowData.tenantId = req.tenantFilter.tenantId; }",
    reason: "Consistent use of req.tenantFilter instead of raw req.user.role comparisons.",
  },

  // ─────────────────────────────────────────────────────────────
  // services/bulkDeleteService.js
  // ─────────────────────────────────────────────────────────────
  {
    file: "server/src/services/bulkDeleteService.js",
    location: "bulkDeleteDeals, bulkDeleteLeads, bulkDeleteOrganizations",
    removed: "if (userContext.role === 'user') { filter.userId = ... }",
    replacedWith: "Removed entirely.",
    reason:
      "Bulk-delete routes are now protected by requirePermission('leads:delete') / " +
      "'deals:delete' / 'organizations:delete'. Only users with those permissions " +
      "can reach the service, so the user-role restriction at service level is dead code. " +
      "Tenant isolation (role !== super_admin) is preserved.",
  },

  // ─────────────────────────────────────────────────────────────
  // controllers/roleController.js
  // ─────────────────────────────────────────────────────────────
  {
    file: "server/src/controllers/roleController.js",
    location: "getAllRoles, getRoleById, updateRole, deleteRole",
    removed: "if (req.user.role !== 'super_admin' && role.tenantId !== req.user.tenantId)",
    replacedWith:
      "Logic moved to roleService.validateRoleOwnership(roleId, tenantId). " +
      "Controllers pass tenantId = null for super_admin callers, which skips the check.",
    reason: "Permission logic belongs in the service layer, not controllers.",
  },

  // ─────────────────────────────────────────────────────────────
  // routes/* (all 14 route files)
  // ─────────────────────────────────────────────────────────────
  {
    file: "server/src/routes/*.js (all 14 route files)",
    removed: "authorize('user', 'admin', 'super_admin') / authorize('admin', 'super_admin') / authorize('super_admin')",
    replacedWith: "requirePermission('<resource>:<action>') — e.g. requirePermission('leads:read')",
    mapping: {
      "leads:*":         ["leads:read", "leads:write", "leads:delete", "leads:export", "leads:view_all"],
      "deals:*":         ["deals:read", "deals:write", "deals:delete", "deals:export", "deals:view_all"],
      "organizations:*": ["organizations:read", "organizations:write", "organizations:delete", "organizations:export", "organizations:view_all"],
      "users:*":         ["users:read", "users:write", "users:delete", "users:manage_roles"],
      "roles:*":         ["roles:read", "roles:write", "roles:delete"],
      "analytics:*":     ["analytics:read", "analytics:export"],
      "calls:*":         ["calls:read", "calls:write", "calls:delete"],
      "comments:*":      ["comments:read", "comments:write", "comments:delete"],
      "attachments:*":   ["attachments:read", "attachments:write", "attachments:delete"],
      "bulk:*":          ["bulk:import"],
      "settings:*":      ["settings:read", "settings:write"],
      "tenants:*":       "Kept as requirePermission('super_admin') — routes legacy ROLE_NAMES path",
    },
    reason: "All route guards migrated to permission strings for fine-grained access control.",
  },

  // ─────────────────────────────────────────────────────────────
  // jobs.js
  // ─────────────────────────────────────────────────────────────
  {
    file: "server/src/routes/jobs.js",
    removed: "No auth middleware at all (completely unprotected endpoint)",
    replacedWith: "passport JWT + authenticate + requirePermission('settings:read')",
    reason: "Previously documented in a comment as 'consider adding auth middleware'. Now enforced.",
  },
];

export default LEGACY_ROLE_CHECKS_REMOVED;
