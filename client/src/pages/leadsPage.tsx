// hooks and basic imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useLeadData, useDebounce } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/services";

// component imports
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
import { ConfirmDialog } from "@/components/common/confirmDialog";
import LeadStatistics from "@/components/leads/leadStatistics";
import { toast } from "sonner";

// other imports
import { exportLeads } from "@/services/exportService";
import { LEAD_SOURCES } from "@/types/interfaces/form-interfaces";

// offline handling imports
import { useOffline } from "@/context/useOffline";
import { useOfflineManager } from "@/hooks/useOfflineManager";

// notification imports
import { useNotifications } from "@/hooks";

const LeadsPage = () => {
  const {
    filteredLeads,
    loading,
    loadingMore,
    error,
    filters,
    fetchLeads,
    createLead,
    deleteLead,
    updateFilter,
    resetFilters,
    searchLeads,
    isSearchMode,
    searchLoading,
    hasNextPage,
    loadMore,
  } = useLeadData();

  // modal usestate
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // selected lead for edit and bulk selection
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  // search state
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 400);

  // navigation
  const navigate = useNavigate();

  // offline handling
  const { isOnline } = useOffline();
  const { queue } = useOfflineManager();

  // notifications
  const { notifyEvent } = useNotifications();

  // Analytics stats (all-time, from server aggregation)
  const leadStatsQuery = useQuery({
    queryKey: ["analytics", "leadStatusBreakdown"],
    queryFn: () => analyticsAPI.leadStatusBreakdown(),
    staleTime: 1000 * 60 * 5,
  });

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // add lead modal handlers
  const handleAddLead = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  // handle edit lead
  const handleEditLead = (id: string) => {
    navigate(`/leads/${id}`);
  };

  // handle delete lead
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
        toast.success("Lead deleted successfully!");
        notifyEvent({
          type: "lead_deleted",
          title: "Lead Deleted",
          message: `A lead was deleted.`,
          entityId: leadToDelete,
          entityType: "lead",
        });
      } catch (error) {
        console.error("Error deleting lead:", error);
        toast.error("Failed to delete lead. Please try again.");
      }
    }
  };

  // handle save lead (for both create and update)
  const handleSaveLead = async (leadData: CreateLeadDTO) => {
    try {
      await createLead(leadData);
      setIsModalOpen(false);
      toast.success("Lead created successfully!");
      notifyEvent({
        type: "lead_created",
        title: "New Lead Created",
        message: `Lead "${leadData.leadFirstName}" was created.`,
        entityId: "",
        entityType: "lead",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "OFFLINE_QUEUED") {
        setIsModalOpen(false);
        toast.info("Lead queued for sync when online", {
          description: "Your changes will be saved when connection is restored",
        });
        return;
      }
      console.error("Error creating lead:", error);
      toast.error(
        "Failed to create lead. Please check the details and try again.",
      );
    }
  };

  // handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  // handle export
  const handleExport = async () => {
    await exportLeads(selectedLeadIds);
    setSelectedLeadIds([]);
  };

  // handle search and filters
  useEffect(() => {
    searchLeads(debouncedSearch, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (isSearchMode && debouncedSearch) {
      searchLeads(debouncedSearch, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.source]);

  // Listen for sync completion events
  useEffect(() => {
    const handleSync = (event: CustomEvent) => {
      const result = event.detail;

      if (result.succeeded > 0) {
        toast.success(`Synced ${result.succeeded} operations`, {
          description: "Your offline changes have been saved",
        });

        // Refresh leads after sync
        fetchLeads();
      }

      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} operations`, {
          description: "Some changes couldn't be saved. Please try again.",
        });
      }
    };

    window.addEventListener("offlineSync", handleSync as EventListener);

    return () => {
      window.removeEventListener("offlineSync", handleSync as EventListener);
    };
  }, [fetchLeads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your leads
          </p>

          {!isOnline && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                Offline Mode
              </span>
              {queue.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                  {queue.length} queued
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-row gap-4">
          <Button
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            onClick={handleExport}
            disabled={selectedLeadIds.length === 0 || !isOnline}
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

      <LeadStatistics
        breakdown={leadStatsQuery.data?.breakdown ?? []}
        total={leadStatsQuery.data?.total ?? 0}
        isLoading={leadStatsQuery.isLoading}
      />

      {/* Filters */}
      <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2 col-span-2">
            <div className="relative">
              {searchLoading ? (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              )}
              <Input
                placeholder="Search leads..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem
                      key={source.value}
                      value={source.value}
                    >
                      {source.value}
                    </SelectItem>
                  ))}
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
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
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
