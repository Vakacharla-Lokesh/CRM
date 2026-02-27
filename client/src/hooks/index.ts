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

export { useLeadData } from "./useLeadData";
export { useUserData } from "./useUserData.ts";
export { useOrganizationData } from "./useOrganizationData.ts";
export { useDealData } from "./useDealData.ts";
export { default as useTenantData } from "./useTenantData.ts";
export { useCallData } from "./useCallData.ts";
export { useCommentData } from "./useCommentData.ts";
export { useAttachmentData } from "./useAttachmentData.ts";
export { useDashboardStats } from "./useDashboardStats.ts";
export { useAnalyticsData } from "./useAnalyticsData.ts";
export { useLeadActivityData } from "./useLeadActivityData.ts";
export { useUserAnalyticsData } from "./useUserAnalyticsData.ts";

export { useWorkflowData } from "./useWorkflowData";

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
