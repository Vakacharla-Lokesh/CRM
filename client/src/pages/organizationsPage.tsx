import { useEffect, useState } from "react";
import { DataTable } from "../components/common/data-table";
import { columns } from "../components/organizations/organization-columns";
import type { CreateOrganizationDTO, Organization } from "@/types";
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
import { OrganizationModal } from "@/components/modals";
import { useOrganizationData } from "@/hooks";

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
      if (selectedOrganization) {
        // EDIT mode - needs updateOrganization from hook
        await updateOrganization(selectedOrganization._id, organizationData);
      } else {
        // CREATE mode
        await createOrganization(organizationData);
      }
      await fetchOrganizations();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving organization:", error);
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

  const handleDeleteOrganization = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      try {
        await deleteOrganization(id);
        await fetchOrganizations();
      } catch (error) {
        console.error("Error deleting organization:", error);
        alert("Failed to delete organization. Please try again.");
      }
    }
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
          <Button className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:bg-muted-foreground disabled:text-muted-foreground">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Organizations
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {statistics.total}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Small (1-50)
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {(statistics.bySize["1-10"] || 0) +
              (statistics.bySize["11-50"] || 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Medium (51-500)
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {(statistics.bySize["51-200"] || 0) +
              (statistics.bySize["201-500"] || 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Large (500+)
          </p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {(statistics.bySize["501-1000"] || 0) +
              (statistics.bySize["1000+"] || 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Size
            </label>
            <Select
              value={filters.size || "all"}
              onValueChange={(value) =>
                updateFilter("size", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sizes</SelectItem>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="501-1000">501-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Industry
            </label>
            <Input
              placeholder="Filter by industry..."
              value={filters.industry}
              onChange={(e) => updateFilter("industry", e.target.value)}
            />
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
      />
    </div>
  );
};

export default OrganizationsPage;
