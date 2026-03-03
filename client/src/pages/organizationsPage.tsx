// hooks and basic imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/services";

// components imports
import { DataTable } from "../components/common/dataTable";
import { columns } from "../components/organizations/organizationColumns";
import { Input } from "../components/ui/input";
import { OrganizationModal } from "@/components/modals";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import OrganizationStatistics from "@/components/organizations/organizationStatistics";

// other imports
import type {
  CreateOrganizationDTO,
  Organization,
  UpdateOrganizationDTO,
} from "@/types";
import { Search } from "lucide-react";
import { useDebounce, useOrganizationData } from "@/hooks";
import { ORGANIZATION_INDUSTRIES } from "@/types/interfaces/form-interfaces/organization.options";
import {
  exportEmailOrganizations,
  exportOrganizations,
} from "@/services/exportService";
import { BulkActionBar } from "@/components/bulk/BulkActionBar";

// offline handling
import { useOffline } from "@/context/useOffline";
import { useOfflineManager } from "@/hooks/useOfflineManager";

// notification imports
import { useNotifications } from "@/hooks";
import EmailExportDialogBox from "@/components/common/emailExportDialogBox";

const OrganizationsPage = () => {
  const {
    filteredOrganizations,
    loading,
    loadingMore,
    error,
    filters,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    updateFilter,
    deleteOrganization,
    resetFilters,
    searchOrganizations,
    hasNextPage,
    loadMore,
  } = useOrganizationData();

  // Analytics stats (all-time, from server aggregation)
  const orgStatsQuery = useQuery({
    queryKey: ["analytics", "organizationStats"],
    queryFn: () => analyticsAPI.organizationStats(),
    staleTime: 1000 * 60 * 5,
  });

  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<
    string[]
  >([]);
  const [selectionResetKey, setSelectionResetKey] = useState(0);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<
    string | null
  >(null);

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

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch organizations on mount
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // add organization modal handler
  const handleAddOrganization = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrganization(null);
  };

  // save organization handler for both create and update
  const handleSaveOrganization = async (
    organizationData: CreateOrganizationDTO,
  ) => {
    try {
      await createOrganization(organizationData);
      handleCloseModal();
      toast.success("Organization created successfully!");
      notifyEvent({
        type: "organization_created",
        title: "Organization Created",
        message: `Organization "${organizationData.name}" has been created.`,
        entityId: "", // you can pass the new organization's ID here if available
        entityType: "organization",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "OFFLINE_QUEUED") {
        handleCloseModal();
        toast.info("Organization queued for sync when online", {
          description: "Your changes will be saved when connection is restored",
        });
        return;
      }
      console.error("Error saving organization:", error);
      toast.error("Failed to create organization. Please try again.");
      throw error;
    }
  };

  // update organization
  const handleUpdateOrganization = async (
    id: string,
    organizationData: UpdateOrganizationDTO,
  ) => {
    try {
      await updateOrganization(id, organizationData);
      handleCloseModal();
      toast.success("Organization updated successfully!");
      notifyEvent({
        type: "organization_updated",
        title: "Organization Updated",
        message: `Organization "${organizationData.name}" has been updated.`,
        entityId: id,
        entityType: "organization",
      });
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization. Please try again.");
      throw error;
    }
  };

  // edit and delete handlers
  const handleEditOrganization = (id: string) => {
    const org = filteredOrganizations.find((o) => o._id === id);
    if (org) {
      setSelectedOrganization(org);
      setIsModalOpen(true);
    }
  };

  const handleDeleteOrganization = (id: string) => {
    setOrganizationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!organizationToDelete) return;

    try {
      await deleteOrganization(organizationToDelete);
      setOrganizationToDelete(null);
      toast.success("Organization deleted successfully!");
      notifyEvent({
        type: "organization_deleted",
        title: "Organization Deleted",
        message: `An organization has been deleted.`,
        entityId: organizationToDelete,
        entityType: "organization",
      });
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error("Failed to delete organization. Please try again.");
      setOrganizationToDelete(null);
    }
  };

  // view leads
  const handleViewLeads = (id: string) => {
    navigate(`/organizations/${id}/leads`);
  };

  // export handler
  const handleExport = async () => {
    await exportOrganizations(selectedOrganizationIds);
    setSelectedOrganizationIds([]);
    setSelectionResetKey((k) => k + 1);
  };

  const handleEmailExport = async () => {
    if (!exportEmail) return;

    try {
      setIsSending(true);

      await exportEmailOrganizations(selectedOrganizationIds, exportEmail);

      toast.success("Export emailed successfully!", {
        description: "Check your inbox for the exported organizations.",
      });

      setSelectedOrganizationIds([]);
      setSelectionResetKey((k) => k + 1);
      setExportEmail("");
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error("Error emailing export:", error);
      toast.error("Failed to email export. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // handle search and filters
  useEffect(() => {
    searchOrganizations(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Listen for sync completion events
  useEffect(() => {
    const handleSync = (event: CustomEvent) => {
      const result = event.detail;

      if (result.succeeded > 0) {
        toast.success(`Synced ${result.succeeded} operations`, {
          description: "Your offline changes have been saved",
        });

        fetchOrganizations();
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
  }, [fetchOrganizations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Organizations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your organizations
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
            onClick={handleAddOrganization}
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add Organization
          </Button>
        </div>
      </div>

      <OrganizationStatistics
        stats={orgStatsQuery.data?.stats ?? []}
        isLoading={orgStatsQuery.isLoading}
      />

      {/* Filters */}
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2 col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search organizations..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Select
              value={filters.industry || "all"}
              onValueChange={(value) =>
                updateFilter("industry", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-45">
                <SelectValue placeholder="All industries" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>

                {ORGANIZATION_INDUSTRIES.map((industry) => (
                  <SelectItem
                    key={industry.value}
                    value={industry.value}
                  >
                    {industry.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex items-end">
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
            <p className="text-gray-600 dark:text-gray-400">
              Loading organizations...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Failed to load organizations
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {error?.message || "An error occurred"}
            </p>
            <Button
              onClick={fetchOrganizations}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns({
            onEdit: handleEditOrganization,
            onDelete: handleDeleteOrganization,
            onViewLeads: handleViewLeads,
          })}
          data={filteredOrganizations}
          name="Organizations"
          searchColumn="name"
          onSelectionChange={(rows) =>
            setSelectedOrganizationIds(rows.map((r) => r._id))
          }
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
          resetSelectionTrigger={selectionResetKey}
        ></DataTable>
      )}

      <BulkActionBar
        selectedIds={selectedOrganizationIds}
        entityType="organizations"
        onClearSelection={() => {
          setSelectedOrganizationIds([]);
          setSelectionResetKey((k) => k + 1);
        }}
        exportHandler={handleExport}
        exportMailHandler={() => setIsExportDialogOpen(true)}
        onDeleteSuccess={fetchOrganizations}
      />

      <OrganizationModal
        isOpen={isModalOpen}
        organization={selectedOrganization}
        onClose={handleCloseModal}
        onSave={handleSaveOrganization}
        onUpdate={handleUpdateOrganization}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Organization"
        description="Are you sure you want to delete this organization? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      <EmailExportDialogBox
        isExportDialogOpen={isExportDialogOpen}
        setIsExportDialogOpen={setIsExportDialogOpen}
        exportEmail={exportEmail}
        setExportEmail={setExportEmail}
        handleEmailExport={handleEmailExport}
        isSending={isSending}
      />
    </div>
  );
};

export default OrganizationsPage;
