import React from "react";
import { ProgressRow } from "./progressRow";
import { Building2, Users } from "lucide-react";
import { EmptyState } from "./emptyState";
import { SkeletonRows } from "./skeletonRow";
import { Progress } from "../ui/progress";

function PipelineSection({
  analyticsLoading,
  leadStatusBreakdown,
  orgStatsData,
  maxOrgCount,
  maxLeadCount,
  maxConvertedCount,
}: {
  analyticsLoading: boolean;
  leadStatusBreakdown: { status: string; count: number; percentage: number }[];
  orgStatsData: {
    industry: string;
    organizations: number;
    leads: number;
    converted: number;
    conversionRate: number;
  }[];
  maxOrgCount: number;
  maxLeadCount: number;
  maxConvertedCount: number;
}) {
  return (
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
  );
}

export default PipelineSection;
