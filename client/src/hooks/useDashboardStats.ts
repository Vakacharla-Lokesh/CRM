import { useState, useEffect, useCallback } from "react";
import { analyticsAPI } from "../services";
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
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [changes, setChanges] = useState<DashboardChanges>(defaultChanges);
  const [period, setPeriod] = useState<DashboardPeriod>(defaultPeriod);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await analyticsAPI.dashboard();

      setStats(response.stats);
      setChanges(response.changes);
      setPeriod(response.period);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard stats",
      );
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

  return { stats, changes, period, loading, error, refreshStats };
};
