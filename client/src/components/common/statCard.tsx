import type { StatCardProps } from "@/types/interfaces/layout/statCard.interfaces";
import { TrendingUp, TrendingDown } from "lucide-react";

function StatCard({ icon, label, value, change, trend }: StatCardProps) {
  const isPositive = trend === "up";

  return (
    <div className="bg-background rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="text-gray-700 dark:text-gray-300">{icon}</div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          }`}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{" "}
          {change}
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
        {label}
      </p>

      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
        Compared to last month
      </p>
    </div>
  );
}

export default StatCard;
