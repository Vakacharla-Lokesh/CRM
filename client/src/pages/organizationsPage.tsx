// hooks and basic imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

// other imports
import type {
  CreateOrganizationDTO,
  Organization,
  UpdateOrganizationDTO,
} from "@/types";
import { Download, Search } from "lucide-react";
import { useDebounce, useOrganizationData } from "@/hooks";
import { ORGANIZATION_INDUSTRIES } from "@/types/interfaces/form-interfaces/organization.options";
import { exportOrganizations } from "@/services/exportService";

// offline handling
import { useOffline } from "@/context/useOffline";
import { useOfflineManager } from "@/hooks/useOfflineManager";

const OrganizationsPage = () => {
  const {
    filteredOrganizations,
    statistics,
    loading,
    error,
    filters,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    updateFilter,
    deleteOrganization,
    resetFilters,
    searchOrganizations,
  } = useOrganizationData();

  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<
    string[]
  >([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<
    string | null
  >(null);

  const navigate = useNavigate();
  const { isOnline } = useOffline();
  const { queue } = useOfflineManager();

  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 400);

  // Fetch organizations on mount
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleAddOrganization = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrganization(null);
  };

  const handleSaveOrganization = async (
    organizationData: CreateOrganizationDTO,
  ) => {
    try {
      await createOrganization(organizationData);
      handleCloseModal();
      toast.success("Organization created successfully!");
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

  const handleUpdateOrganization = async (
    id: string,
    organizationData: UpdateOrganizationDTO,
  ) => {
    try {
      await updateOrganization(id, organizationData);
      await fetchOrganizations();
      handleCloseModal();
      toast.success("Organization updated successfully!");
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization. Please try again.");
      throw error;
    }
  };

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
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error("Failed to delete organization. Please try again.");
      setOrganizationToDelete(null);
    }
  };
  const handleViewLeads = (id: string) => {
    navigate(`/organizations/${id}/leads`);
  };

  const handleExport = async () => {
    await exportOrganizations(selectedOrganizationIds);
    setSelectedOrganizationIds([]);
  };

  useEffect(() => {
    searchOrganizations(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

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
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:bg-muted-foreground"
            onClick={handleExport}
            disabled={selectedOrganizationIds.length === 0 || !isOnline}
          >
            <Download className="w-4 h-4" />
            Export
            {selectedOrganizationIds.length > 0
              ? ` (${selectedOrganizationIds.length})`
              : ""}
          </Button>
          <Button
            onClick={handleAddOrganization}
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add Organization
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Organizations
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {statistics.total}
          </p>
        </div>
      </div>

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
          searchColumn="organizationName"
          onSelectionChange={(rows) =>
            setSelectedOrganizationIds(rows.map((r) => r._id))
          }
        ></DataTable>
      )}

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
    </div>
  );
};

export default OrganizationsPage;
