import { useEffect, useState } from "react";
import { DataTable } from "../components/common/data-table";
import { columns } from "../components/leads/lead-columns";
import type { Lead, CreateLeadDTO } from "@/types";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { LeadModal } from "@/components/modals";
import { leadService } from "@/services";

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await leadService.getAllLeads();
        setLeads(res);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch leads");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeads();
  }, []);

  const handleAddLead = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (leadData: CreateLeadDTO) => {
    // TODO: Replace with actual API call
    // console.log("Saving lead:", leadData);

    // // Mock creating a new lead
    // const newLead: Lead = {
    //   _id: `lead-${leads.length + 1}`,
    //   leadId: `LEAD-${leads.length + 1}`,
    //   leadFirstName: leadData.leadFirstName,
    //   leadLastName: leadData.leadLastName,
    //   leadEmail: leadData.leadEmail,
    //   leadSource: leadData.leadSource || "API",
    //   leadStatus: leadData.leadStatus || "New",
    //   leadScore: leadData.leadScore || 0,
    //   organizationId: leadData.organizationId,
    //   tenantId: leadData.tenantId,
    //   userId: "current-user-id",
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // };

    leadService.createLead(leadData).then((newLead) => {
      setLeads((prev) => [newLead, ...prev]);
    });
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage leads and their status
          </p>
        </div>
        <div className="flex flex-row gap-4">
          <Button className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:bg-muted-foreground disabled:text-muted-foreground">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={handleAddLead}
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add Lead
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading leads...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Failed to load leads
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
          data={leads}
        />
      )}

      <LeadModal
        isOpen={isModalOpen}
        lead={selectedLead}
        onClose={handleCloseModal}
        onSave={handleSaveLead}
      />
    </div>
  );
};

export default LeadsPage;
