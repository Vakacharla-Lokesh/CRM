import { useState, useEffect } from "react";
import { useDealData, useDebounce, useNotifications } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/services";
import { exportDeals, exportEmailDeals } from "@/services/exportService";
import { toast } from "sonner";
import { type Deal, type UpdateDealDTO, type DealStatus, type CreateDealDTO } from "@/types";

export function useDealsPageState() {
  const {
    filteredDeals,
    loading,
    loadingMore,
    error,
    filters,
    updateFilter,
    clearFilters,
    updateDeal,
    createDeal,
    deleteDeal,
    searchDeals,
    searchLoading,
    hasNextPage,
    loadMore,
    refresh,
  } = useDealData();

  // analytics stats
  const dealStatsQuery = useQuery({
    queryKey: ["analytics", "dealPipeline", filters.status],
    queryFn: () => analyticsAPI.dealPipeline({ status: filters.status || undefined }),
    staleTime: 1000 * 60 * 5,
  });

  // search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // selected deal for edit
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // selection state for bulk actions
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [selectionResetKey, setSelectionResetKey] = useState(0);

  // notifications
  const { notifyEvent } = useNotifications();

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  // search handler
  useEffect(() => {
    searchDeals(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleAddDeal = () => {
    setSelectedDeal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const deal = filteredDeals.find((d) => d._id === id);
    if (deal) {
      setSelectedDeal(deal);
      setIsModalOpen(true);
    }
  };

  const handleDeleteDeal = (id: string) => {
    setDealToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!dealToDelete) return;

    try {
      await deleteDeal(dealToDelete);
      setDealToDelete(null);
      toast.success("Deal deleted successfully!");
      notifyEvent({
        type: "deal_deleted",
        title: "Deal Deleted",
        message: `A deal has been deleted.`,
        entityId: dealToDelete,
        entityType: "deal",
      });
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.error("Failed to delete deal. Please try again.");
      setDealToDelete(null);
    }
  };

  const handleSave = async (dealData: UpdateDealDTO) => {
    if (!selectedDeal) {
      try {
        await createDeal(dealData as unknown as CreateDealDTO);
        setIsModalOpen(false);
        toast.success("Deal created successfully!");
      } catch (error) {
        console.error("Error creating deal:", error);
        toast.error("Failed to create deal. Please try again.");
        throw error;
      }
      return;
    }

    try {
      await updateDeal(selectedDeal._id, dealData);
      setIsModalOpen(false);
      setSelectedDeal(null);
      toast.success("Deal updated successfully!");
      notifyEvent({
        type: "deal_updated",
        title: "Deal Updated",
        message: `The deal "${dealData.name}" has been updated.`,
        entityId: selectedDeal._id,
        entityType: "deal",
      });
    } catch (error) {
      console.error("Error updating deal:", error);
      toast.error("Failed to update deal. Please try again.");
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDeal(null);
  };

  const handleExport = async () => {
    await exportDeals(selectedDealIds);
    setSelectedDealIds([]);
    setSelectionResetKey((k) => k + 1);
  };

  const handleEmailExport = async () => {
    if (!exportEmail) return;

    try {
      setIsSending(true);
      await exportEmailDeals(selectedDealIds, exportEmail);
      toast.success("Export emailed successfully!", {
        description: "Check your inbox for the exported deals.",
      });
      setSelectedDealIds([]);
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

  const handleClearFilters = () => {
    clearFilters();
    setSearchInput("");
  };

  const handleStageFilter = (value: string) => {
    updateFilter("stage", value === "all" ? "" : (value as DealStatus));
  };

  const resetSelection = () => {
    setSelectedDealIds([]);
    setSelectionResetKey((k) => k + 1);
  };

  return {
    // data
    filteredDeals,
    loading,
    loadingMore,
    error,
    filters,
    hasNextPage,
    loadMore,
    searchLoading,

    // analytics
    dealStatsQuery,

    // search
    searchInput,
    setSearchInput,

    // modal
    isModalOpen,
    selectedDeal,

    // delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,

    // bulk selection
    selectedDealIds,
    setSelectedDealIds,
    selectionResetKey,
    resetSelection,

    // export
    isExportDialogOpen,
    setIsExportDialogOpen,
    exportEmail,
    setExportEmail,
    isSending,

    // refresh
    fetchDeals: refresh,

    // update filter
    updateFilter,

    // handlers
    handleAddDeal,
    handleEdit,
    handleDeleteDeal,
    confirmDelete,
    handleSave,
    handleCloseModal,
    handleExport,
    handleEmailExport,
    handleClearFilters,
    handleStageFilter,
  };
}
