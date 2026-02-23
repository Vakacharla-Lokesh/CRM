import type { Lead } from "@/types";

const LeadStatistics = ({ filteredLeads }: { filteredLeads: Lead[] }) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Leads
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {filteredLeads.length}
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">New</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {filteredLeads.filter((lead) => lead.leadStatus === "New").length}
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Follow-Up</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {
              filteredLeads.filter((lead) => lead.leadStatus === "Follow-Up")
                .length
            }
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Converted</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {
              filteredLeads.filter((lead) => lead.leadStatus === "Converted")
                .length
            }
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Dead</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {filteredLeads.filter((lead) => lead.leadStatus === "Dead").length}
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 col-span-1">
          <p>Conversion Rate</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {filteredLeads.length > 0
              ? Math.round(
                  (filteredLeads.filter(
                    (lead) => lead.leadStatus === "Converted",
                  ).length /
                    filteredLeads.length) *
                    100,
                )
              : 0}
            %
          </p>
        </div>
      </div>
    </>
  );
};

export default LeadStatistics;
