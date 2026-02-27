// hooks and basic imports
import { useState, useEffect } from "react";
import { useDebounce, useTenantData } from "@/hooks";
import { useOffline } from "@/context/useOffline";
import { useNavigate } from "react-router-dom";

// component imports
import { DataTable } from "@/components/common/dataTable";
import { columns } from "@/components/tenants/tenantColumns";
import { Button } from "@/components/ui/button";
import { TenantModal } from "@/components/modals";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import { toast } from "sonner";
import TenantStatistics from "@/components/tenants/tenantStatistics";

// other imports
import type { Tenant, CreateTenantDto } from "@/types/tenant";
import { Plus, Search } from "lucide-react";

// notification imports
import { useNotifications } from "@/hooks";

const TenantsPage = () => {
  const {
    filteredTenants,
    statistics,
    loading,
    loadingMore,
    error,
    filters,
    clearFilters,
    searchTenants,
    isSearchMode,
    searchLoading,
    createTenant,
    updateTenant,
    deleteTenant,
    refresh,
    hasNextPage,
    loadMore,
  } = useTenantData();

  // navigation handler
  const navigate = useNavigate();

  // offline status
  const { isOnline } = useOffline();

  // modal usestate
  const [isModalOpen, setIsModalOpen] = useState(false);

  // selected tenant for edit and delete
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);

  // delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // notifications
  const { notifyEvent } = useNotifications();

  // search state
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    searchTenants(debouncedSearch, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (isSearchMode && debouncedSearch) {
      searchTenants(debouncedSearch, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFrom, filters.dateTo]);

  // handle save tenant for both create and update
  const handleSaveTenant = async (tenantData: CreateTenantDto) => {
    try {
      if (selectedTenant) {
        await updateTenant(selectedTenant._id, tenantData);
        toast.success("Tenant updated successfully!");
        notifyEvent({
          type: "tenant_updated",
          title: "Tenant Updated",
          message: `Tenant ${tenantData.tenantName} has been updated successfully.`,
          entityId: selectedTenant._id,
          entityType: "tenant",
        });
      } else {
        await createTenant(tenantData);
        setIsModalOpen(false);
        setSelectedTenant(null);
        toast.success("Tenant created successfully!");
        notifyEvent({
          type: "tenant_created",
          title: "Tenant Created",
          message: `Tenant ${tenantData.tenantName} has been created successfully.`,
          entityId: "",
          entityType: "tenant",
        });
      }
    } catch (error) {
      console.error("Error saving tenant:", error);
      toast.error("Failed to save tenant. Please try again.");
      throw error;
    }
  };

  // handle open modal for create tenant
  const handleOpenModal = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  // handle edit tenant and delete tenant
  const handleEditTenant = (id: string) => {
    const tenant = filteredTenants.find((t) => t._id === id);
    if (tenant) {
      setSelectedTenant(tenant);
      setIsModalOpen(true);
    } else {
      console.error("Tenant not found for editing:", id);
      toast.error("Tenant not found for editing.");
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
      refresh();
      setTenantToDelete(null);
      toast.success("Tenant deleted successfully!");
      notifyEvent({
        type: "tenant_deleted",
        title: "Tenant Deleted",
        message: `A tenant has been deleted successfully.`,
        entityId: tenantToDelete,
        entityType: "tenant",
      });
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error("Failed to delete tenant. Please try again.");
      setTenantToDelete(null);
    }
  };

  // navigate to tenant details page to view users of tenant
  const viewUsersOfTenant = (id: string) => {
    navigate(`/tenants/${id}`);
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
          disabled={!isOnline}
        >
          <Plus className="h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {/* Statistics Cards */}
      <TenantStatistics statistics={statistics} />

      {/* Filters */}
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              {searchLoading ? (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <Input
                placeholder="Search tenants by name, email, or mobile..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              clearFilters();
              setSearchInput("");
            }}
            disabled={!searchInput && !filters.dateFrom && !filters.dateTo}
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
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
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
