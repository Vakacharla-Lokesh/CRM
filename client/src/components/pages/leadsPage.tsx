import { useEffect, useState } from "react";
import { DataTable } from "../common/data-table";
import { columns } from "../leads/lead-columns";
import LeadModal from "../modals/leadModal";
import type { Lead, CreateLeadDTO } from "@/types";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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

  const handleAddLead = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (leadData: CreateLeadDTO) => {
    // TODO: Replace with actual API call
    console.log("Saving lead:", leadData);

    // Mock creating a new lead
    const newLead: Lead = {
      _id: `lead-${leads.length + 1}`,
      leadId: `LEAD-${leads.length + 1}`,
      leadFirstName: leadData.leadFirstName,
      leadLastName: leadData.leadLastName,
      leadEmail: leadData.leadEmail,
      leadSource: leadData.leadSource || "API",
      leadStatus: leadData.leadStatus || "New",
      leadScore: leadData.leadScore || 0,
      organizationId: leadData.organizationId,
      tenantId: leadData.tenantId,
      userId: "current-user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setLeads((prev) => [newLead, ...prev]);
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
            className="px-4 py-2font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add Lead
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={leads}
      ></DataTable>

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
