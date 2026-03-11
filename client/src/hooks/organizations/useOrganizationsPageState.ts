import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/services";
import { useDebounce, useOrganizationData, useNotifications } from "@/hooks";
import { useOffline } from "@/context/useOffline";
import { useOfflineManager } from "@/hooks/useOfflineManager";
import { useBulkImportOrganizations } from "@/hooks/organizations/useImportOrganizations";
import {
  exportEmailOrganizations,
  exportOrganizations,
} from "@/services/exportService";
import { toast } from "sonner";
import type {
  CreateOrganizationDTO,
  Organization,
  UpdateOrganizationDTO,
} from "@/types";

export function useOrganizationsPageState() {
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

  // analytics stats
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

  // import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // fetch organizations on mount
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
      notifyEvent({
        type: "organization_created",
        title: "Organization Created",
        message: `Organization "${organizationData.name}" has been created.`,
        entityId: "",
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

  const handleViewLeads = (id: string) => {
    navigate(`/organizations/${id}/leads`);
  };

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

  // search effect
  useEffect(() => {
    searchOrganizations(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // listen for offline sync completion
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

  const { importOrganizations, loading: importOrgLoading } =
    useBulkImportOrganizations();

  const handleBulkImport = () => {
    setIsImportModalOpen(true);
  };

  return {
    // data
    filteredOrganizations,
    loading,
    loadingMore,
    error,
    filters,
    fetchOrganizations,
    resetFilters,
    updateFilter,
    hasNextPage,
    loadMore,

    // analytics
    orgStatsQuery,

    // selection
    selectedOrganization,
    selectedOrganizationIds,
    setSelectedOrganizationIds,
    selectionResetKey,

    // modal
    isModalOpen,

    // delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,

    // search
    searchInput,
    setSearchInput,

    // offline
    isOnline,
    queue,

    // export
    isExportDialogOpen,
    setIsExportDialogOpen,
    exportEmail,
    setExportEmail,
    isSending,

    // import
    isImportModalOpen,
    setIsImportModalOpen,
    importOrganizations,
    importOrgLoading,

    // handlers
    handleAddOrganization,
    handleCloseModal,
    handleSaveOrganization,
    handleUpdateOrganization,
    handleEditOrganization,
    handleDeleteOrganization,
    confirmDelete,
    handleViewLeads,
    handleExport,
    handleEmailExport,
    handleBulkImport,
  };
}
