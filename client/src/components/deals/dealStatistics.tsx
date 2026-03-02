import { formatCompactCurrency } from "@/utils/";
import type {
  DealPipelineStage,
  DealPipelineSummary,
} from "@/services/api/analytics.api";

interface DealStatisticsProps {
  pipeline: DealPipelineStage[];
  summary: DealPipelineSummary;
  isLoading?: boolean;
}

const DealStatistics = ({
  pipeline,
  summary,
  isLoading,
}: DealStatisticsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const OPEN_STAGES = [
    "Prospecting",
    "Qualification",
    "Negotiation",
    "Ready to close",
  ];
  const forecastValue = pipeline
    .filter((p) => OPEN_STAGES.includes(p.stage))
    .reduce((sum, p) => sum + p.totalValue, 0);
  const wonCount = pipeline.find((p) => p.stage === "Won")?.count ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Deals</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {summary.totalDeals}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
          {formatCompactCurrency(summary.totalPipelineValue)}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Value</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
          {formatCompactCurrency(summary.avgDealValue)}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Forecast</p>
        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
          {formatCompactCurrency(forecastValue)}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Won</p>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
          {wonCount}
        </p>
      </div>
    </div>
  );
};

export default DealStatistics;
