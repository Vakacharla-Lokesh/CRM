export { useAsync } from "./useAsync.ts";
export { useAuth } from "./useAuth.ts";
export { useDebounce } from "./useDebounce.ts";
export { useFetch } from "./useFetch.ts";
export { useForm } from "./useForm.ts";
export { useIndexedDB } from "./useIndexedDB.ts";

// Temporarily during migration — swap back if needed
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
