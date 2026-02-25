import type { LeadStatusEntry } from "@/services/api/analytics.api";

interface LeadStatisticsProps {
  breakdown: LeadStatusEntry[];
  total: number;
  isLoading?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  New: "text-green-600 dark:text-green-400",
  "Follow-Up": "text-yellow-600 dark:text-yellow-400",
  Converted: "text-blue-600 dark:text-blue-400",
  Dead: "text-red-600 dark:text-red-400",
};

const LeadStatistics = ({ breakdown, total, isLoading }: LeadStatisticsProps) => {
  const getCount = (status: string) =>
    breakdown.find((b) => b.status === status)?.count ?? 0;

  const converted = getCount("Converted");
  const conversionRate =
    total > 0 ? ((converted / total) * 100).toFixed(1) : "0";

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {total}
        </p>
      </div>

      {["New", "Follow-Up", "Converted", "Dead"].map((status) => (
        <div
          key={status}
          className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              STATUS_STYLES[status] ?? "text-gray-900 dark:text-white"
            }`}
          >
            {getCount(status)}
          </p>
        </div>
      ))}

      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
          {conversionRate}%
        </p>
      </div>
    </div>
  );
};

export default LeadStatistics;
