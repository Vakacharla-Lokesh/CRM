import type { UserStatistics } from "@/types";

const UserStatistics = ({ statistics }: { statistics: UserStatistics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {statistics.total}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
          {statistics.active}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
          {statistics.inactive}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
          {(statistics.byRole.admin || 0) +
            (statistics.byRole.super_admin || 0)}
        </p>
      </div>
    </div>
  );
};

export default UserStatistics;
