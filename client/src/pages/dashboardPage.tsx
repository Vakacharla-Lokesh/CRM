import { Users, Megaphone, TrendingUp, DollarSign, TrendingDown, Building2 } from "lucide-react";
import StatCard from "../components/common/statCard";
import { useDashboardStats, useAnalyticsData } from "../hooks";
import { Progress } from "../components/ui/progress";

function DashboardPage() {
  const { stats, changes, loading, error } = useDashboardStats();
  const { leadTrends, organizationStats, loading: analyticsLoading } = useAnalyticsData(30);

  // Transform data for progress bars
  const leadTrendData = leadTrends
    .map((trend) => ({
      date: new Date(trend._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      leads: trend.count,
    }))
    .slice(-10); // Show last 10 days

  const maxLeads = Math.max(...leadTrendData.map(d => d.leads), 1);

  const orgStatsData = organizationStats.map((stat) => ({
    industry: stat.industry,
    organizations: stat.organizationCount,
    leads: stat.leadCount,
    converted: stat.convertedLeads,
  }));

  const maxOrgCount = Math.max(...orgStatsData.map(d => d.organizations), 1);
  const maxLeadCount = Math.max(...orgStatsData.map(d => d.leads), 1);
  const maxConvertedCount = Math.max(...orgStatsData.map(d => d.converted), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's your marketing overview.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          <p className="font-medium">Error loading dashboard stats</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={32} />}
          label="Total Leads"
          value={loading ? "..." : stats.totalLeads.toLocaleString()}
          change={`${changes.leadsChange >= 0 ? "+" : ""}${changes.leadsChange.toFixed(1)}%`}
          trend={changes.leadsChange >= 0 ? "up" : "down"}
        />
        <StatCard
          icon={<Megaphone size={32} />}
          label="Active Campaigns"
          value={loading ? "..." : stats.activeCampaigns}
          change={`${changes.campaignsChange >= 0 ? "+" : ""}${changes.campaignsChange.toFixed(1)}%`}
          trend={changes.campaignsChange >= 0 ? "up" : "down"}
        />
        <StatCard
          icon={<TrendingUp size={32} />}
          label="Conversion Rate"
          value={loading ? "..." : `${stats.conversionRate}%`}
          change={`${changes.conversionRateChange >= 0 ? "+" : ""}${changes.conversionRateChange.toFixed(1)}%`}
          trend={changes.conversionRateChange >= 0 ? "up" : "down"}
        />
        <StatCard
          icon={<DollarSign size={32} />}
          label="Revenue"
          value={loading ? "..." : `$${(stats.revenue / 1000).toFixed(1)}K`}
          change={`${changes.revenueChange >= 0 ? "+" : ""}${changes.revenueChange.toFixed(1)}%`}
          trend={changes.revenueChange >= 0 ? "up" : "down"}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lead Trends
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 10 days activity</p>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                </div>
              ))}
            </div>
          ) : leadTrendData.length === 0 ? (
            <div className="py-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <TrendingDown className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No data available</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start adding leads to see trends</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {leadTrendData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.date}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{item.leads} leads</span>
                  </div>
                  <Progress 
                    value={(item.leads / maxLeads) * 100} 
                    className="h-2.5 bg-gray-100 dark:bg-gray-700"
                    style={{
                      '--progress-background': 'rgb(99, 102, 241)'
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Organization Stats by Industry */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Organizations by Industry
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Performance breakdown</p>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                </div>
              ))}
            </div>
          ) : orgStatsData.length === 0 ? (
            <div className="py-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No data available</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start adding organizations to see stats</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orgStatsData.map((item, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{item.industry}</h3>
                  
                  {/* Organizations Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Organizations</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.organizations}</span>
                    </div>
                    <Progress 
                      value={(item.organizations / maxOrgCount) * 100} 
                      className="h-2 bg-gray-100 dark:bg-gray-700"
                      style={{
                        '--progress-background': 'rgb(99, 102, 241)'
                      } as React.CSSProperties}
                    />
                  </div>

                  {/* Leads Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Leads</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.leads}</span>
                    </div>
                    <Progress 
                      value={(item.leads / maxLeadCount) * 100} 
                      className="h-2 bg-gray-100 dark:bg-gray-700"
                      style={{
                        '--progress-background': 'rgb(79, 70, 229)'
                      } as React.CSSProperties}
                    />
                  </div>

                  {/* Converted Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Converted</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.converted}</span>
                    </div>
                    <Progress 
                      value={(item.converted / maxConvertedCount) * 100} 
                      className="h-2 bg-gray-100 dark:bg-gray-700"
                      style={{
                        '--progress-background': 'rgb(67, 56, 202)'
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
