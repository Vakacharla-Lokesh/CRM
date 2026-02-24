import React from "react";
import { Progress } from "../ui/progress";
import { SkeletonRows } from "./skeletonRow";
import { EmptyState } from "./emptyState";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

function TrendsSection({
  analyticsLoading,
  leadTrendData,
  maxLeads,
  dealPipelineSummary,
  dealPipeline,
  maxDealValue,
}: {
  analyticsLoading: boolean;
  leadTrendData: { date: string; leads: number }[];
  maxLeads: number;
  dealPipelineSummary: {
    totalDeals: number;
    totalPipelineValue: number;
    avgDealValue: number;
  };
  dealPipeline: {
    stage: string;
    count: number;
    totalValue: number;
  }[];
  maxDealValue: number;
}) {
  return (
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
  );
}

export default TrendsSection;
