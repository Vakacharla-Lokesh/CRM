import type { OrgIndustryStat } from "@/services/api/analytics.api";

interface OrganizationStatisticsProps {
  stats: OrgIndustryStat[];
  isLoading?: boolean;
}

function OrganizationStatistics({ stats, isLoading }: OrganizationStatisticsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
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

  const totalOrganizations = stats.reduce((s, i) => s + i.organizationCount, 0);
  const totalLeads = stats.reduce((s, i) => s + i.totalLeads, 0);
  const totalConverted = stats.reduce((s, i) => s + i.convertedLeads, 0);
  const overallConversionRate =
    totalLeads > 0
      ? ((totalConverted / totalLeads) * 100).toFixed(1)
      : "0";
  const industryCount = stats.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total Organizations
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {totalOrganizations}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
          {totalLeads}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
          {overallConversionRate}%
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Industries</p>
        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
          {industryCount}
        </p>
      </div>
    </div>
  );
}

export default OrganizationStatistics;
