import { formatCurrency } from "@/utils/";
import type { DealStatistics } from "@/hooks/useDealData";

const dealStatistics = ({ statistics }: { statistics: DealStatistics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Deals</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {statistics.total}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
          {formatCurrency(statistics.totalValue)}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Value</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
          {formatCurrency(statistics.avgValue)}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Forecast</p>
        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
          {formatCurrency(statistics.forecastValue)}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Won</p>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
          {statistics.byStage.closed_won || 0}
        </p>
      </div>
    </div>
  );
};

export default dealStatistics;
