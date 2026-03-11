export { useAuth } from "./useAuth.ts";
export { useDebounce } from "./useDebounce.ts";
export { useForm } from "./useForm.ts";
export { useIndexedDB } from "./useIndexedDB.ts";
export {
  useRoles,
  useRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "./useRoles.ts";
export {
  usePermissions,
  useHasPermission,
  useHasAllPermissions,
  useHasAnyPermission,
} from "./usePermissions.ts";

export { useLeadData } from "./leads/useLeadData.ts";
export { useLeadDetails } from "./leads/useLeadDetails.ts";
export { useLeadStageManagement } from "./leads/useLeadStageManagement.ts";
export { useBulkImportLeads } from "./leads/useImportLeads.ts";
export { useUserData } from "./users/useUserData.ts";
export { useOrganizationData } from "./organizations/useOrganizationData.ts";
export { useDealData } from "./deals/useDealData.ts";
export { default as useTenantData } from "./tenants/useTenantData.ts";
export { useCallData } from "./leads/tabs/useCallData.ts";
export { useCommentData } from "./leads/tabs/useCommentData.ts";
export { useAttachmentData } from "./leads/tabs/useAttachmentData.ts";
export { useDashboardStats } from "./analytics/useDashboardStats.ts";
export { useAnalyticsData } from "./analytics/useAnalyticsData.ts";
export { useLeadActivityData } from "./leads/useLeadActivityData.ts";
export { useUserAnalyticsData } from "./users/useUserAnalyticsData.ts";

export { useWorkflowData } from "./useWorkflowData.ts";
export { useLeadsPageState } from "./leads/useLeadsPageState.ts";
export { useDealsPageState } from "./deals/useDealsPageState.ts";
export { useOrganizationsPageState } from "./organizations/useOrganizationsPageState.ts";

export { useOfflineManager } from "./useOfflineManager.ts";
export {
  useLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
  removeFromLocalStorage,
  clearLocalStorage,
} from "./useLocalStorage.ts";
export { useAppContext } from "./useAppContext.ts";
export { useNotifications } from "./useNotifications.ts";
export { useUsersStats } from "./users/useUsersStats.ts";
export { useTenantsStats } from "./tenants/useTenantsStats.ts";
export { useSocket } from "./useSocket.ts";

export { usePipelineData } from "./usePipelineData.ts";
