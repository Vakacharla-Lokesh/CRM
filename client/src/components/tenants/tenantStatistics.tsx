function TenantStatistics({ statistics }: { statistics: { total: number,  } }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total Tenants
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {statistics.total}
        </p>
      </div>
    </div>
  );
}

export default TenantStatistics;
