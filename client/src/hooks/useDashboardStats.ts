import { useState, useEffect, useCallback } from "react";
import { analyticsAPI } from "../services";

interface DashboardStats {
  totalLeads: number;
  activeCampaigns: number;
  conversionRate: number;
  revenue: number;
}

interface StatsChanges {
  leadsChange: number;
  campaignsChange: number;
  conversionRateChange: number;
  revenueChange: number;
}

interface DashboardData {
  stats: DashboardStats;
  changes: StatsChanges;
  period: {
    startDate: string;
    endDate: string;
  };
}

export const useDashboardStats = () => {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalLeads: 0,
      activeCampaigns: 0,
      conversionRate: 0,
      revenue: 0,
    },
    changes: {
      leadsChange: 0,
      campaignsChange: 0,
      conversionRateChange: 0,
      revenueChange: 0,
    },
    period: {
      startDate: "",
      endDate: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsAPI.dashboard() as DashboardData;
      
      if (response.stats) {
        setData(response);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    stats: data.stats,
    changes: data.changes,
    period: data.period,
    loading,
    error,
    refreshStats,
  };
};
