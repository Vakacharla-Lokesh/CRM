import type { UsersStatsResponse } from "@/services/api/stats.api";

interface UserStatisticsProps {
  statistics: UsersStatsResponse | undefined;
  isLoading?: boolean;
}

const UserStatistics = ({ statistics, isLoading }: UserStatisticsProps) => {
  const placeholder = (
    <span className="inline-block w-8 h-7 rounded bg-muted animate-pulse" />
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg p-4 shadow-sm border border-border bg-card">
        <p className="text-sm text-muted-foreground">Total Users</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {isLoading ? placeholder : (statistics?.totalUsers ?? 0)}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-border bg-card">
        <p className="text-sm text-muted-foreground">Active</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
          {isLoading ? placeholder : (statistics?.activeUsers ?? 0)}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-border bg-card">
        <p className="text-sm text-muted-foreground">Inactive</p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
          {isLoading ? placeholder : (statistics?.inactiveUsers ?? 0)}
        </p>
      </div>
      {/* <div className="rounded-lg p-4 shadow-sm border border-border bg-card">
        <p className="text-sm text-muted-foreground">Admins</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
          {isLoading ? placeholder : (statistics?.adminsCount ?? 0)}
        </p>
      </div> */}
    </div>
  );
};

export default UserStatistics;
