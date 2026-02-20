import { useState, useEffect } from "react";
import { Users, Megaphone, TrendingUp, DollarSign } from "lucide-react";
import StatCard from "../components/common/statCard";
import { useDashboardStats } from "../hooks";
import type { Lead } from "../types";

function DashboardPage() {
  const { stats, changes, loading, error } = useDashboardStats();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [, setIsLoading] = useState(true);

  // Simulate loading leads data
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockLeads: Lead[] = Array.from({ length: 25 }, (_, i) => ({
        _id: `lead-${i + 1}`,
        leadFirstName: `Lead`,
        leadLastName: `${i + 1}`,
        leadEmail: `lead${i + 1}@example.com`,
        leadSource: i % 2 === 0 ? "API" : "Outsource",
        leadStatus: ["New", "Converted", "Dead", "Follow-Up"][i % 4] as
          | "New"
          | "Converted"
          | "Dead"
          | "Follow-Up",
        leadScore: Math.floor(Math.random() * 100),
        organizationId: `org-${i + 1}`,
        userId: `user-${i + 1}`,
        tenantId: `tenant-1`,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ),
        updatedAt: new Date(),
      }));
      setLeads(mockLeads);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Lead Graphs
          </h2>
          <div className="h-64 flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Chart Component
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                (Will be integrated later with Chart.js or Recharts)
              </p>
            </div>
          </div>
        </div>

        {/* Top Performing Leads */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Leads
          </h2>
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div
                key={lead._id}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer"
              >
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {lead.leadFirstName} {lead.leadLastName || ""}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {lead.organizationId || "No organization"}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      lead.leadStatus === "Converted"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {lead.leadStatus}
                  </span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {lead.leadScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
