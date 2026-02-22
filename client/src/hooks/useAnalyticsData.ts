import { useState, useEffect, useCallback } from "react";
import { analyticsAPI } from "../services";
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
} from "../services/api/analytics.api";

interface UseAnalyticsDataReturn {
  // Leads
  leadTrends: LeadTrendDay[];
  leadStatusBreakdown: LeadStatusEntry[];
  leadScoreDistribution: ScoreBucket[];
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
  const [leadTrends, setLeadTrends] = useState<LeadTrendDay[]>([]);
  const [leadStatusBreakdown, setLeadStatusBreakdown] = useState<
    LeadStatusEntry[]
  >([]);
  const [leadScoreDistribution, setLeadScoreDistribution] = useState<
    ScoreBucket[]
  >([]);

  const [dealPipeline, setDealPipeline] = useState<DealPipelineStage[]>([]);
  const [dealPipelineSummary, setDealPipelineSummary] =
    useState<DealPipelineSummary>(defaultPipelineSummary);
  const [dealPipelineMonthlyTrends, setDealPipelineMonthlyTrends] = useState<
    DealPipelineMonthlyTrend[]
  >([]);
  const [dealTrends, setDealTrends] = useState<DealTrendDay[]>([]);

  const [organizationStats, setOrganizationStats] = useState<OrgIndustryStat[]>(
    [],
  );
  const [topOrganizations, setTopOrganizations] = useState<TopOrganization[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        trendsRes,
        statusRes,
        scoreRes,
        pipelineRes,
        dealTrendsRes,
        orgStatsRes,
        topOrgsRes,
      ] = await Promise.all([
        analyticsAPI.leadTrends({ days }),
        analyticsAPI.leadStatusBreakdown({ days }),
        analyticsAPI.leadScoreDistribution(),
        analyticsAPI.dealPipeline(),
        analyticsAPI.dealTrends({ days }),
        analyticsAPI.organizationStats(),
        analyticsAPI.topOrganizations({ limit: 10 }),
      ]);

      setLeadTrends(trendsRes.trends);
      setLeadStatusBreakdown(statusRes.breakdown);
      setLeadScoreDistribution(scoreRes.distribution);

      setDealPipeline(pipelineRes.pipeline);
      setDealPipelineSummary(pipelineRes.summary);
      setDealPipelineMonthlyTrends(pipelineRes.trends);
      setDealTrends(dealTrendsRes.trends);

      setOrganizationStats(orgStatsRes.stats);
      setTopOrganizations(topOrgsRes.organizations);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data",
      );
      setLoading(false);
    }
  }, [days]);

  const refreshData = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    leadTrends,
    leadStatusBreakdown,
    leadScoreDistribution,
    dealPipeline,
    dealPipelineSummary,
    dealPipelineMonthlyTrends,
    dealTrends,
    organizationStats,
    topOrganizations,
    loading,
    error,
    refreshData,
  };
};
