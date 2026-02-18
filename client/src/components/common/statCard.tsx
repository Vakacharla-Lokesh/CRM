import React from "react";

/**
 * StatCard Component
 * Location: src/components/Common/StatCard.jsx
 * Purpose: Display individual statistics with icon, value, and trend
 * Props:
 * - icon: emoji or icon string
 * - label: stat label text
 * - value: stat value to display
 * - change: change amount/percentage
 * - trend: 'up' or 'down' for trend indicator
 */
function StatCard({ icon, label, value, change, trend }) {
  const isPositive = trend === "up";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      {/* Header with Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          }`}
        >
          {isPositive ? "↑" : "↓"} {change}
        </span>
      </div>

      {/* Label */}
      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
        {label}
      </p>

      {/* Value */}
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>

      {/* Footer Note */}
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
        Compared to last month
      </p>
    </div>
  );
}

export default StatCard;
