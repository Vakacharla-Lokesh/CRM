import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { analyticsAPI } from "@/services";
import type {
  DashboardStats,
  DashboardChanges,
  DashboardPeriod,
} from "@/services/api/index";

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  changes: DashboardChanges;
  period: DashboardPeriod;
  loading: boolean;
  error: string | null;
  refreshStats: () => void;
}

const defaultStats: DashboardStats = {
  totalLeads: 0,
  convertedLeads: 0,
  conversionRate: 0,
  activeCampaigns: 0,
  revenue: 0,
  totalDeals: 0,
  openDeals: 0,
  totalOrganizations: 0,
};

const defaultChanges: DashboardChanges = {
  leadsChange: 0,
  conversionRateChange: 0,
  revenueChange: 0,
  campaignsChange: 0,
};

const defaultPeriod: DashboardPeriod = {
  days: 30,
  currentStart: "",
  currentEnd: "",
  previousStart: "",
  previousEnd: "",
};

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => analyticsAPI.dashboard(),
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
    networkMode: "offlineFirst",
    placeholderData: {
      stats: defaultStats,
      changes: defaultChanges,
      period: defaultPeriod,
    },
  });

  const stats = data?.stats ?? defaultStats;
  const changes = data?.changes ?? defaultChanges;
  const period = data?.period ?? defaultPeriod;
  const error = queryError instanceof Error ? queryError.message : null;

  const refreshStats = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  }, [queryClient]);

  return {
    stats,
    changes,
    period,
    loading,
    error,
    refreshStats,
  };
};
