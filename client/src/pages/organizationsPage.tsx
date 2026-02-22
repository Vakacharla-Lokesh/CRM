import { useEffect, useState } from "react";
import { DataTable } from "../components/common/dataTable";
import { columns } from "../components/organizations/organizationColumns";
import type {
  CreateOrganizationDTO,
  Organization,
  UpdateOrganizationDTO,
} from "@/types";
import { Button } from "../components/ui/button";
import { Download, Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { OrganizationModal } from "@/components/modals";
import { useOrganizationData } from "@/hooks";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORGANIZATION_INDUSTRIES } from "@/types/form-interfaces/organization.options";
import { useNavigate } from "react-router-dom";

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
  } = useOrganizationData();

  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<
    string | null
  >(null);
  const navigate = useNavigate();

  // Fetch organizations on mount
  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      await fetchOrganizations();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving organization:", error);
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
    } catch (error) {
      console.error("Error updating organization:", error);
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
      await fetchOrganizations();
      setOrganizationToDelete(null);
    } catch (error) {
      console.error("Error deleting organization:", error);
      alert("Failed to delete organization. Please try again.");
      setOrganizationToDelete(null);
    }
  };
  const handleViewLeads = (id: string) => {
    navigate(`/organizations/${id}/leads`);
  };

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
        </div>
        <div className="flex flex-row gap-4">
          <Button
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:bg-muted-foreground"
            disabled={true}
          >
            <Download className="w-4 h-4" />
            Export
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
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
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
