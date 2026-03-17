import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { analyticsAPI } from "@/services";
import type {
  LeadTrendDay,
  LeadStatusEntry,
  ScoreBucket,
  DealPipelineStage,
  DealPipelineSummary,
  DealPipelineMonthlyTrend,
  DealTrendDay,
  OrgIndustryStat,
  TopOrganization,
} from "@/services/api/analytics.api";

interface UseAnalyticsDataReturn {
  // Leads
  leadTrends: LeadTrendDay[];
  statusBreakdown: LeadStatusEntry[];
  scoreDistribution: ScoreBucket[];
  // Deals
  dealPipeline: DealPipelineStage[];
  dealPipelineSummary: DealPipelineSummary;
  dealPipelineMonthlyTrends: DealPipelineMonthlyTrend[];
  dealTrends: DealTrendDay[];
  // Orgs
  organizationStats: OrgIndustryStat[];
  topOrganizations: TopOrganization[];
  // Meta
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

const defaultPipelineSummary: DealPipelineSummary = {
  totalPipelineValue: 0,
  totalDeals: 0,
  avgDealValue: 0,
};

export const useAnalyticsData = (days: number = 30): UseAnalyticsDataReturn => {
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: [
      {
        queryKey: ["analytics", "leadTrends", days],
        queryFn: () => analyticsAPI.leadTrends({ days }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["analytics", "statusBreakdown", days],
        queryFn: () => analyticsAPI.statusBreakdown({ days }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["analytics", "scoreDistribution"],
        queryFn: () => analyticsAPI.scoreDistribution(),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["analytics", "dealPipeline"],
        queryFn: () => analyticsAPI.dealPipeline(),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["analytics", "dealTrends", days],
        queryFn: () => analyticsAPI.dealTrends({ days }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["analytics", "organizationStats"],
        queryFn: () => analyticsAPI.organizationStats(),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["analytics", "topOrganizations"],
        queryFn: () => analyticsAPI.topOrganizations({ limit: 10 }),
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const [
    leadTrendsQ,
    statusQ,
    scoreQ,
    dealPipelineQ,
    dealTrendsQ,
    orgStatsQ,
    topOrgsQ,
  ] = results;

  const loading = results.some((q) => q.isLoading);

  const errorObj = results.find((q) => q.error);
  const error = errorObj
    ? errorObj.error instanceof Error
      ? errorObj.error.message
      : "Failed to fetch analytics data"
    : null;

  // Destructure pipeline response (one endpoint, three fields)
  const pipelineData = dealPipelineQ.data;

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  }, [queryClient]);

  return {
    leadTrends: leadTrendsQ.data?.trends ?? [],
    statusBreakdown: statusQ.data?.breakdown ?? [],
    scoreDistribution: scoreQ.data?.distribution ?? [],
    dealPipeline: pipelineData?.pipeline ?? [],
    dealPipelineSummary: pipelineData?.summary ?? defaultPipelineSummary,
    dealPipelineMonthlyTrends: pipelineData?.trends ?? [],
    dealTrends: dealTrendsQ.data?.trends ?? [],
    organizationStats: orgStatsQ.data?.stats ?? [],
    topOrganizations: topOrgsQ.data?.organizations ?? [],
    loading,
    error,
    refreshData,
  };
};
