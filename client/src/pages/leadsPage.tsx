import { useEffect, useState } from "react";
import { DataTable } from "../components/common/dataTable";
import { columns } from "../components/leads/leadColumns";
import type { CreateLeadDTO, Lead } from "@/types";
import { Button } from "../components/ui/button";
import { Download, Search } from "lucide-react";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { LeadModal } from "@/components/modals";
import { useLeadData } from "@/hooks";
import { exportLeads } from "@/services/exportService";
import { useNavigate } from "react-router";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

const LeadsPage = () => {
  const {
    filteredLeads,
    loading,
    error,
    filters,
    fetchLeads,
    createLead,
    deleteLead,
    updateFilter,
    resetFilters,
  } = useLeadData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
    // eslint_disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddLead = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (id: string) => {
    navigate(`/leads/${id}`);
  };

  const handleDeleteLead = (id: string) => {
    setLeadToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (leadToDelete) {
      try {
        await deleteLead(leadToDelete);
        setDeleteDialogOpen(false);
        setLeadToDelete(null);
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  const handleSaveLead = async (leadData: CreateLeadDTO) => {
    try {
      await createLead(leadData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating lead:", error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleExport = async () => {
    await exportLeads(selectedLeadIds);
    setSelectedLeadIds([]);
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
          <Button
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            onClick={handleExport}
            disabled={selectedLeadIds.length === 0}
          >
            <Download className="w-4 h-4" />
            Export
            {selectedLeadIds.length > 0 ? ` (${selectedLeadIds.length})` : ""}
          </Button>
          <Button
            onClick={handleAddLead}
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add Lead
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
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

      {/* Filters */}
      <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2 col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex sm:flex-col lg:flex-row gap-x-2 mx-2">
            <div className="space-y-2">
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  updateFilter("status", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Follow-Up">Follow-Up</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Dead">Dead</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select
                value={filters.source || "all"}
                onValueChange={(value) =>
                  updateFilter("source", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 flex items-end mx-8">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
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
              {error?.message || "An error occurred"}
            </p>
            <Button
              onClick={fetchLeads}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns({
            onEdit: handleEditLead,
            onDelete: handleDeleteLead,
          })}
          data={filteredLeads}
          name="Leads"
          searchColumn="leadEmail"
          onSelectionChange={(rows) =>
            setSelectedLeadIds(rows.map((r) => r._id))
          }
        />
      )}

      <LeadModal
        isOpen={isModalOpen}
        lead={selectedLead}
        onClose={handleCloseModal}
        onSave={handleSaveLead}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default LeadsPage;
