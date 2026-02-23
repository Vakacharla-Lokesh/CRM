import {
  Users,
  Megaphone,
  TrendingUp,
  DollarSign,
  TrendingDown,
  Building2,
} from "lucide-react";
import StatCard from "../components/common/statCard";
import { useDashboardStats, useAnalyticsData } from "../hooks";
import { Progress } from "../components/ui/progress";
import { SkeletonRows } from "@/components/dashboard/skeletonRow";
import { EmptyState } from "@/components/dashboard/emptyState";
import { ProgressRow } from "@/components/dashboard/progressRow";

function DashboardPage() {
  const { stats, changes, loading, error } = useDashboardStats();

  const {
    leadTrends,
    leadStatusBreakdown,
    organizationStats,
    dealPipeline,
    dealPipelineSummary,
    loading: analyticsLoading,
  } = useAnalyticsData(30);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Trends */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--primary) 12%, transparent)",
              }}
            >
              <TrendingUp
                className="w-5 h-5"
                style={{ color: "var(--primary)" }}
              />
            </div>
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Lead Trends
              </h2>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Last 10 days activity
              </p>
            </div>
          </div>

          {analyticsLoading ? (
            <SkeletonRows count={5} />
          ) : leadTrendData.length === 0 ? (
            <EmptyState
              icon={<TrendingDown className="w-12 h-12" />}
              message="No lead data"
              sub="Start adding leads to see trends"
            />
          ) : (
            <div className="space-y-4">
              {leadTrendData.map((item) => (
                <div
                  key={item.date}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span
                      style={{ color: "var(--foreground)" }}
                      className="font-medium"
                    >
                      {item.date}
                    </span>
                    <span
                      style={{ color: "var(--primary)" }}
                      className="font-semibold"
                    >
                      {item.leads} leads
                    </span>
                  </div>
                  <Progress
                    value={(item.leads / maxLeads) * 100}
                    className="h-2.5"
                    style={
                      {
                        "--progress-background": "var(--primary)",
                      } as React.CSSProperties
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deal Pipeline */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--primary) 12%, transparent)",
              }}
            >
              <DollarSign
                className="w-5 h-5"
                style={{ color: "var(--primary)" }}
              />
            </div>
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Deal Pipeline
              </h2>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Value by stage
              </p>
            </div>
          </div>

          {/* Pipeline summary strip */}
          {!analyticsLoading && dealPipelineSummary.totalDeals > 0 && (
            <div
              className="flex items-center gap-4 mb-5 mt-3 px-3 py-2 rounded-lg text-xs"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--muted) 40%, transparent)",
                color: "var(--muted-foreground)",
              }}
            >
              <span>
                <strong style={{ color: "var(--foreground)" }}>
                  {dealPipelineSummary.totalDeals}
                </strong>{" "}
                deals
              </span>
              <span>
                <strong style={{ color: "var(--foreground)" }}>
                  ${(dealPipelineSummary.totalPipelineValue / 1000).toFixed(1)}K
                </strong>{" "}
                total
              </span>
              <span>
                <strong style={{ color: "var(--foreground)" }}>
                  ${(dealPipelineSummary.avgDealValue / 1000).toFixed(1)}K
                </strong>{" "}
                avg
              </span>
            </div>
          )}

          {analyticsLoading ? (
            <SkeletonRows count={4} />
          ) : dealPipeline.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="w-12 h-12" />}
              message="No deal data"
              sub="Start adding deals to see pipeline"
            />
          ) : (
            <div className="space-y-4 mt-2">
              {dealPipeline.map((stage) => (
                <div
                  key={stage.stage}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span
                      style={{ color: "var(--foreground)" }}
                      className="font-medium"
                    >
                      {stage.stage}
                    </span>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {stage.count} deals
                      </span>
                      <span
                        style={{ color: "var(--primary)" }}
                        className="font-semibold"
                      >
                        ${(stage.totalValue / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(stage.totalValue / maxDealValue) * 100}
                    className="h-2"
                    style={
                      {
                        "--progress-background": "var(--primary)",
                      } as React.CSSProperties
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Breakdown */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--primary) 12%, transparent)",
              }}
            >
              <Users
                className="w-5 h-5"
                style={{ color: "var(--primary)" }}
              />
            </div>
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Lead Status
              </h2>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Last 30 days breakdown
              </p>
            </div>
          </div>

          {analyticsLoading ? (
            <SkeletonRows count={4} />
          ) : leadStatusBreakdown.length === 0 ? (
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              message="No status data"
              sub="Start adding leads to see breakdown"
            />
          ) : (
            <div className="space-y-4">
              {leadStatusBreakdown.map((item) => (
                <div
                  key={item.status}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className="font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.status}
                    </span>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {item.percentage}%
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--primary)" }}
                      >
                        {item.count}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={item.percentage}
                    className="h-2"
                    style={
                      {
                        "--progress-background": "var(--primary)",
                      } as React.CSSProperties
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Organizations by Industry */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--primary) 12%, transparent)",
              }}
            >
              <Building2
                className="w-5 h-5"
                style={{ color: "var(--primary)" }}
              />
            </div>
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Organizations by Industry
              </h2>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Performance breakdown
              </p>
            </div>
          </div>

          {analyticsLoading ? (
            <SkeletonRows
              count={3}
              taller
            />
          ) : orgStatsData.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-12 h-12" />}
              message="No org data"
              sub="Start adding organizations to see stats"
            />
          ) : (
            <div className="space-y-6">
              {orgStatsData.map((item) => (
                <div
                  key={item.industry}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className="font-semibold text-sm capitalize"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.industry}
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--primary) 12%, transparent)",
                        color: "var(--primary)",
                      }}
                    >
                      {item.conversionRate}% converted
                    </span>
                  </div>

                  <ProgressRow
                    label="Organizations"
                    value={item.organizations}
                    max={maxOrgCount}
                  />
                  <ProgressRow
                    label="Leads"
                    value={item.leads}
                    max={maxLeadCount}
                  />
                  <ProgressRow
                    label="Converted"
                    value={item.converted}
                    max={maxConvertedCount}
                    dimmed
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default DashboardPage;
