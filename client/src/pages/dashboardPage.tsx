import {
  Users,
  Megaphone,
  TrendingUp,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { useState, useCallback } from "react";
import StatCard from "../components/common/statCard";
import { useDashboardStats, useAnalyticsData } from "../hooks";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";
import TrendsSection from "@/components/dashboard/trendsSection";
import PipelineSection from "@/components/dashboard/pipelineSection";

const REFRESH_DEBOUNCE_DELAY = 5000; // 5 seconds

function DashboardPage() {
  const { stats, changes, loading, error, refreshStats } = useDashboardStats();

  const {
    leadTrends,
    statusBreakdown,
    organizationStats,
    dealPipeline,
    dealPipelineSummary,
    loading: analyticsLoading,
    refreshData,
  } = useAnalyticsData(30);

  const [isDebounced, setIsDebounced] = useState(false);
  const isRefreshing = loading || analyticsLoading;

  const performRefresh = useCallback(() => {
    refreshStats();
    refreshData();
  }, [refreshStats, refreshData]);

  const debouncedRefresh = useDebouncedCallback(() => {
    setIsDebounced(true);
    performRefresh();

    setTimeout(() => {
      setIsDebounced(false);
    }, REFRESH_DEBOUNCE_DELAY);
  }, 300);

  const handleRefresh = () => {
    if (!isDebounced && !isRefreshing) {
      debouncedRefresh();
    }
  };

  const leadTrendData = leadTrends.slice(-10).map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    leads: t.total,
  }));

  const maxLeads = Math.max(...leadTrendData.map((d) => d.leads), 1);

  const orgStatsData = organizationStats.map((s) => ({
    industry: s.industry ?? "Unknown",
    organizations: s.organizationCount,
    leads: s.totalLeads,
    converted: s.convertedLeads,
    conversionRate: s.conversionRate,
  }));

  const maxOrgCount = Math.max(...orgStatsData.map((d) => d.organizations), 1);
  const maxLeadCount = Math.max(...orgStatsData.map((d) => d.leads), 1);
  const maxConvertedCount = Math.max(
    ...orgStatsData.map((d) => d.converted),
    1,
  );

  const maxDealValue = Math.max(...dealPipeline.map((d) => d.totalValue), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Dashboard
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Welcome back! Here's your marketing overview.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isDebounced}
          title={
            isDebounced
              ? "Please wait before refreshing again"
              : "Refresh dashboard"
          }
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            border: "1px solid var(--border)",
            color: "var(--muted-foreground)",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <RefreshCw
            size={15}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-lg border text-sm"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--destructive) 10%, transparent)",
            borderColor: "var(--destructive)",
            color: "var(--destructive)",
          }}
        >
          <p className="font-medium">Error loading dashboard stats</p>
          <p className="opacity-80">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={32} />}
          label="Total Leads"
          value={loading ? "..." : stats.totalLeads.toLocaleString()}
          change={`${changes.leadsChange >= 0 ? "+" : ""}${changes.leadsChange.toFixed(1)}%`}
          trend={changes.leadsChange >= 0 ? "up" : "down"}
        />
        <StatCard
          icon={<Megaphone size={32} />}
          label="Active Campaigns"
          value={loading ? "..." : stats.activeCampaigns.toString()}
          change={`${changes.campaignsChange >= 0 ? "+" : ""}${changes.campaignsChange.toFixed(1)}%`}
          trend={changes.campaignsChange >= 0 ? "up" : "down"}
        />
        <StatCard
          icon={<TrendingUp size={32} />}
          label="Conversion Rate"
          value={loading ? "..." : `${stats.conversionRate}%`}
          change={`${changes.conversionRateChange >= 0 ? "+" : ""}${changes.conversionRateChange.toFixed(1)}%`}
          trend={changes.conversionRateChange >= 0 ? "up" : "down"}
        />
        <StatCard
          icon={<DollarSign size={32} />}
          label="Revenue"
          value={
            loading
              ? "..."
              : stats.revenue >= 1000
                ? `$${(stats.revenue / 1000).toFixed(1)}K`
                : `$${stats.revenue.toLocaleString()}`
          }
          change={`${changes.revenueChange >= 0 ? "+" : ""}${changes.revenueChange.toFixed(1)}%`}
          trend={changes.revenueChange >= 0 ? "up" : "down"}
        />
      </div>

      <TrendsSection
        analyticsLoading={analyticsLoading}
        leadTrendData={leadTrendData}
        maxLeads={maxLeads}
        dealPipelineSummary={dealPipelineSummary}
        dealPipeline={dealPipeline}
        maxDealValue={maxDealValue}
      />

      <PipelineSection
        analyticsLoading={analyticsLoading}
        statusBreakdown={statusBreakdown}
        orgStatsData={orgStatsData}
        maxOrgCount={maxOrgCount}
        maxLeadCount={maxLeadCount}
        maxConvertedCount={maxConvertedCount}
      />
    </div>
  );
}

export default DashboardPage;
