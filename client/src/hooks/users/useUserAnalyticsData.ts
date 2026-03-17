import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { userAnalyticsAPI } from "@/services/api/userAnalytics.api";
import type { Widget } from "@/services/api/";

const QUERY_KEY = ["userAnalytics", "dashboard"] as const;

interface UseUserAnalyticsReturn {
  widgets: Widget[];
  loading: boolean;
  error: string | null;
  saveDashboard: (layout: Omit<Widget, "data">[]) => Promise<void>;
  saving: boolean;
  refresh: () => void;
}

export const useUserAnalyticsData = (): UseUserAnalyticsReturn => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => userAnalyticsAPI.getDashboard(),
    staleTime: 1000 * 60 * 2,
  });

  const mutation = useMutation({
    mutationFn: (layout: Omit<Widget, "data">[]) =>
      userAnalyticsAPI.saveDashboard(layout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const saveDashboard = useCallback(
    async (layout: Omit<Widget, "data">[]) => {
      await mutation.mutateAsync(layout);
    },
    [mutation],
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  const errorMsg = error
    ? error instanceof Error
      ? error.message
      : "Failed to load analytics dashboard"
    : null;

  return {
    widgets: data?.layout ?? [],
    loading: isLoading,
    error: errorMsg,
    saveDashboard,
    saving: mutation.isPending,
    refresh,
  };
};
