// hooks and basic imports
import { useState, useEffect } from "react";
import { useDebounce, useTenantData, useTenantsStats } from "@/hooks";
import { useOffline } from "@/context/useOffline";
import { useNavigate } from "react-router-dom";

// other imports
import type { Tenant, CreateTenantDto } from "@/types/tenant";

// notification imports
import { useNotifications } from "@/hooks";
import { toast } from "sonner";

export function useTenantPageState() {
  const {
    filteredTenants,
    filters,
    searchTenants,
    isSearchMode,
    createTenant,
    updateTenant,
    deleteTenant,
    refresh,
    // additional from hook
    loading,
    error,
    searchLoading,
    clearFilters,
    hasNextPage,
    loadMore,
    loadingMore,
  } = useTenantData();

  const { data: tenantsStats, isLoading: statsLoading } = useTenantsStats();

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
          message: `Tenant ${tenantData.name} has been updated successfully.`,
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
          message: `Tenant ${tenantData.name} has been created successfully.`,
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

  return {
    tenantsStats,
    statsLoading,
    isOnline,
    isModalOpen,
    selectedTenant,
    tenantToDelete,
    deleteDialogOpen,
    // setters so callers can control modal / dialog directly
    setIsModalOpen,
    setSelectedTenant,
    setDeleteDialogOpen,
    searchInput,
    setSearchInput,
    handleSaveTenant,
    handleOpenModal,
    handleEditTenant,
    handleDeleteTenant,
    confirmDelete,
    viewUsersOfTenant,
    searchLoading,
    clearFilters,
    // expose data + state used by page
    filteredTenants,
    filters,
    loading,
    error,
    hasNextPage,
    loadMore,
    loadingMore,
  };
}
