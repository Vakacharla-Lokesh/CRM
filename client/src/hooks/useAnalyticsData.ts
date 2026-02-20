import { useState, useEffect, useCallback } from "react";
import { analyticsAPI } from "../services";

interface LeadTrend {
  _id: string;
  count: number;
}

interface LeadStatusBreakdown {
  _id: string;
  count: number;
}

interface OrganizationStat {
  industry: string;
  organizationCount: number;
  leadCount: number;
  convertedLeads: number;
  totalSize: number;
  avgSize: number;
}

export const useAnalyticsData = (days: number = 30) => {
  const [leadTrends, setLeadTrends] = useState<LeadTrend[]>([]);
  const [leadStatusBreakdown, setLeadStatusBreakdown] = useState<LeadStatusBreakdown[]>([]);
  const [organizationStats, setOrganizationStats] = useState<OrganizationStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [trendsResponse, statusResponse, orgResponse] = await Promise.all([
        analyticsAPI.leadTrends({ days }),
        analyticsAPI.leadStatusBreakdown({ days }),
        analyticsAPI.organizationStats(),
      ]);

      if (trendsResponse && typeof trendsResponse === 'object' && 'trends' in trendsResponse) {
        setLeadTrends(trendsResponse.trends as LeadTrend[]);
      }

      if (statusResponse && typeof statusResponse === 'object' && 'breakdown' in statusResponse) {
        setLeadStatusBreakdown(statusResponse.breakdown as LeadStatusBreakdown[]);
      }

      if (orgResponse && typeof orgResponse === 'object' && 'stats' in orgResponse) {
        setOrganizationStats(orgResponse.stats as OrganizationStat[]);
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
    } finally {
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
    organizationStats,
    loading,
    error,
    refreshData,
  };
};
