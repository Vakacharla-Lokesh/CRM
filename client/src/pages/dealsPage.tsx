import { useEffect, useState } from "react";
import { DataTable } from "../components/common/data-table";
import { columns } from "../components/deals/deal-columns";
import type { Deal } from "@/types";

const DealsPage = () => {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockDeals: Deal[] = Array.from({ length: 25 }, (_, i) => ({
        _id: `deal-${i + 1}`,
        dealName: `Deal ${i + 1}`,
        dealValue: Math.floor(Math.random() * 100000) + 5000,
        dealStage: [
          "Prospecting",
          "Qualification",
          "Negotiation",
          "Ready to close",
          "Closed Won",
          "Closed Lost",
        ][i % 6] as Deal["dealStage"],
        dealProbability: Math.floor(Math.random() * 100),
        organizationId: `org-${Math.floor(i / 3) + 1}`,
        leadIds: [`lead-${i + 1}`],
        ownerId: `user-${(i % 5) + 1}`,
        tenantId: `tenant-1`,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ),
        updatedAt: new Date(),
      }));
      setDeals(mockDeals);
    }, 500);

    return () => clearTimeout(timer);
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

      <DataTable
        columns={columns}
        data={deals}
      ></DataTable>
    </div>
  );
};

export default DealsPage;
