import { useEffect, useState } from "react";
import { DataTable } from "../components/common/data-table";
import { columns } from "../components/deals/deal-columns";
import type { Deal } from "@/types";
import dealService from "@/services/dealService";
import { Button } from "@/components/ui/button";

const DealsPage = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeals() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await dealService.getAllDeals();
        setDeals(res);
      } catch (err) {
        console.error("Error fetching deals:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch deals");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDeals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Deals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your deals and pipelines
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading deals...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Failed to load deals
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={deals}
          name="Deals"
        ></DataTable>
      )}
    </div>
  );
};

export default DealsPage;
