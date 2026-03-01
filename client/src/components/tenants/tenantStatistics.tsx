import type { TenantsStatsResponse } from "@/services/api/stats.api";

interface TenantStatisticsProps {
  statistics: TenantsStatsResponse | undefined;
  isLoading?: boolean;
}

function TenantStatistics({ statistics, isLoading }: TenantStatisticsProps) {
  const placeholder = (
    <span className="inline-block w-8 h-7 rounded bg-muted animate-pulse" />
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg p-4 shadow-sm border border-border bg-card">
        <p className="text-sm text-muted-foreground">Total Tenants</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {isLoading ? placeholder : (statistics?.totalTenants ?? 0)}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-border bg-card">
        <p className="text-sm text-muted-foreground">Active</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
          {isLoading ? placeholder : (statistics?.activeTenants ?? 0)}
        </p>
      </div>
      <div className="rounded-lg p-4 shadow-sm border border-border bg-card">
        <p className="text-sm text-muted-foreground">Suspended</p>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
          {isLoading ? placeholder : (statistics?.suspendedTenants ?? 0)}
        </p>
      </div>
    </div>
  );
}

export default TenantStatistics;
