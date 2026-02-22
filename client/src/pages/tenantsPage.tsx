import { useState } from "react";
import { DataTable } from "../components/common/dataTable";
import { columns } from "../components/tenants/tenantColumns";
import type { Tenant, CreateTenantDto } from "@/types/tenant";
import { Button } from "@/components/ui/button";
import { TenantModal } from "@/components/modals";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTenantData } from "@/hooks";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

const TenantsPage = () => {
  const {
    filteredTenants,
    statistics,
    loading,
    error,
    filters,
    updateFilter,
    clearFilters,
    createTenant,
    updateTenant,
    deleteTenant,
    refresh,
  } = useTenantData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);

  const handleSaveTenant = async (tenantData: CreateTenantDto) => {
    try {
      if (selectedTenant) {
        await updateTenant(selectedTenant._id, tenantData);
      } else {
        await createTenant(tenantData);
      }
      setIsModalOpen(false);
      setSelectedTenant(null);
    } catch (error) {
      console.error("Error saving tenant:", error);
      throw error;
    }
  };

  const handleOpenModal = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleEditTenant = (id: string) => {
    const tenant = filteredTenants.find((t) => t._id === id);
    if (tenant) {
      setSelectedTenant(tenant);
      setIsModalOpen(true);
    } else {
      console.error("Tenant not found for editing:", id);
    }
  };

  const handleDeleteTenant = (id: string) => {
    setTenantToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tenantToDelete) return;

    try {
      await deleteTenant(tenantToDelete);
      refresh(); // Refresh the tenant data after deletion
    } catch (error) {
      console.error("Error deleting tenant:", error);
      alert("Failed to delete tenant. Please try again.");
    } finally {
      setTenantToDelete(null);
    }
  };

  const viewUsersOfTenant = (id: string) => {
    // Navigate to the users page for the selected tenant
    window.location.href = `/tenants/${id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tenants
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage tenant organizations
          </p>
        </div>
        <Button
          onClick={handleOpenModal}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Tenants
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {statistics.total}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tenants by name, email, or mobile..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!filters.search && !filters.dateFrom && !filters.dateTo}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading tenants...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Failed to load tenants
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {error.message}
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
          columns={columns({
            onEdit: handleEditTenant,
            onDelete: handleDeleteTenant,
            onViewUsers: viewUsersOfTenant,
          })}
          data={filteredTenants}
          name="Tenants"
          searchColumn="tenantName"
        ></DataTable>
      )}

      <TenantModal
        isOpen={isModalOpen}
        tenant={selectedTenant}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTenant(null);
        }}
        onSave={handleSaveTenant}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Tenant"
        description="Are you sure you want to delete this tenant? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default TenantsPage;
