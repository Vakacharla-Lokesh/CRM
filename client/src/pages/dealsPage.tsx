// hooks and basic imports
import { useState, useEffect } from "react";
import { useDealData, useDebounce } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/services";

// components imports
import { DataTable } from "../components/common/dataTable";
import { columns } from "../components/deals/dealColumns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DealModal } from "@/components/modals";
import {
  type Deal,
  type UpdateDealDTO,
  type DealStatus,
  statuses,
} from "@/types";
import DealStatistics from "@/components/deals/dealStatistics";
import { toast } from "sonner";

// other imports
import { Search } from "lucide-react";
import { BulkActionBar } from "@/components/bulk/bulkActionBar";
import { exportDeals, exportEmailDeals } from "@/services/exportService";

// notification imports
import { useNotifications } from "@/hooks";
import EmailExportDialogBox from "@/components/common/emailExportDialogBox";

const DealsPage = () => {
  const {
    filteredDeals,
    loading,
    loadingMore,
    error,
    filters,
    updateFilter,
    clearFilters,
    updateDeal,
    deleteDeal,
    searchDeals,
    searchLoading,
    hasNextPage,
    loadMore,
  } = useDealData();

  // Analytics stats (all-time, from server aggregation)
  const dealStatsQuery = useQuery({
    queryKey: ["analytics", "dealPipeline"],
    queryFn: () => analyticsAPI.dealPipeline(),
    staleTime: 1000 * 60 * 5,
  });

  // search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  // modal usestate
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

  // search handlers
  useEffect(() => {
    searchDeals(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // edit and delete handlers
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

  // save handler for deal modal
  const handleSave = async (dealData: UpdateDealDTO) => {
    if (!selectedDeal) return;

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

  // close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDeal(null);
  };

  // export handler
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Deals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your deals and pipelines
          </p>
        </div>
      </div>

      <DealStatistics
        pipeline={dealStatsQuery.data?.pipeline ?? []}
        summary={
          dealStatsQuery.data?.summary ?? {
            totalPipelineValue: 0,
            totalDeals: 0,
            avgDealValue: 0,
          }
        }
        isLoading={dealStatsQuery.isLoading}
      />

      {/* Filters */}
      <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search deals..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
          <Select
            value={filters.stage || "all"}
            onValueChange={(value) =>
              updateFilter(
                "stage",
                value === "all" ? "" : (value as DealStatus),
              )
            }
          >
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="Filter by Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {statuses.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                >
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              clearFilters();
              setSearchInput("");
            }}
            disabled={
              !searchInput &&
              !filters.stage &&
              !filters.dateFrom &&
              !filters.dateTo &&
              !filters.minValue &&
              !filters.maxValue
            }
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading deals...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Failed to load deals
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
          columns={columns({ onEdit: handleEdit, onDelete: handleDeleteDeal })}
          data={filteredDeals}
          name="Deals"
          searchColumn="name"
          onSelectionChange={(rows) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSelectedDealIds(rows.map((r: any) => r._id))
          }
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
          resetSelectionTrigger={selectionResetKey}
        ></DataTable>
      )}

      <BulkActionBar
        selectedIds={selectedDealIds}
        entityType="deals"
        onClearSelection={() => {
          setSelectedDealIds([]);
          setSelectionResetKey((k) => k + 1);
        }}
        exportMailHandler={() => setIsExportDialogOpen(true)}
        exportHandler={handleExport}
      />

      <DealModal
        key={selectedDeal?._id ?? "new"}
        isOpen={isModalOpen}
        deal={selectedDeal}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Deal"
        description="Are you sure you want to delete this deal? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      {/* Dialog */}
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

export default DealsPage;
