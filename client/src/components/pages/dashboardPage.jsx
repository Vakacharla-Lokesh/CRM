import React, { useState, useEffect } from "react";
import LeadGrid from "../Common/LeadGrid";
import StatCard from "../Common/StatCard";

/**
 * DashboardPage Component
 * Route: /
 * Purpose: Main dashboard displaying overview statistics and lead grid
 * Features:
 * - Quick stats cards (Leads, Campaigns, Conversion Rate, Revenue)
 * - Lead grid with search and filtering
 * - Real-time data updates
 * - Responsive layout
 * - Performance metrics
 */
function DashboardPage() {
  const [stats, setStats] = useState({
    totalLeads: 12450,
    activeCampaigns: 8,
    conversionRate: 3.2,
    revenue: 125400,
  });

  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading leads data
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockLeads = Array.from({ length: 25 }, (_, i) => ({
        id: `lead-${i + 1}`,
        name: `Lead ${i + 1}`,
        email: `lead${i + 1}@example.com`,
        company: `Company ${String.fromCharCode(65 + (i % 26))}`,
        status: ["new", "contacted", "qualified", "negotiating"][i % 4],
        score: Math.floor(Math.random() * 100),
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ),
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
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
          + New Campaign
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          label="Total Leads"
          value={stats.totalLeads.toLocaleString()}
          change="+12%"
          trend="up"
        />
        <StatCard
          icon="📢"
          label="Active Campaigns"
          value={stats.activeCampaigns}
          change="+2"
          trend="up"
        />
        <StatCard
          icon="📈"
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change="+0.8%"
          trend="up"
        />
        <StatCard
          icon="💰"
          label="Revenue"
          value={`$${(stats.revenue / 1000).toFixed(1)}K`}
          change="+25%"
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Performance Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Campaign Performance
          </h2>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Chart Component
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                (Will be integrated in Phase 4 with Chart.js or Recharts)
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
                key={lead.id}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer"
              >
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {lead.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {lead.company}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      lead.status === "qualified"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {lead.status}
                  </span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {lead.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Grid */}
      <LeadGrid
        leads={leads}
        isLoading={isLoading}
      />
    </div>
  );
}

export default DashboardPage;
