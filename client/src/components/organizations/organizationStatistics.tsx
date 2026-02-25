function OrganizationStatistics({
  statistics,
}: {
  statistics: { total: number; byIndustry: Record<string, number> };
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total Organizations
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {statistics.total}
        </p>
      </div>
      {Object.entries(statistics.byIndustry).map(([industry, count]) => (
        <div
          key={industry}
          className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">{industry}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {count}
          </p>
        </div>
      ))}
    </div>
  );
}

export default OrganizationStatistics;
