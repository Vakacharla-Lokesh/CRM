import { useEffect, useState } from "react";
import { DataTable } from "../common/data-table";
import { columns } from "../leads/lead-columns";
import type { Lead } from "@/types";

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

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
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage leads and their status
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
          <span>+</span> Add Lead
        </button>
      </div>

      {/* Leads Table */}
      <DataTable
        columns={columns}
        data={leads}
      ></DataTable>
    </div>
  );
};

export default LeadsPage;
