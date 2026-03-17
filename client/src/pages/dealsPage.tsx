import { useDealsPageState } from "@/hooks/deals/useDealsPageState";
import { DataTable } from "@/components/common/dataTable";
import { columns } from "@/components/deals/dealColumns";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { BulkActionBar } from "@/components/bulk/bulkActionBar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DealModal } from "@/components/modals";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import DealStatistics from "@/components/deals/dealStatistics";
import EmailExportDialogBox from "@/components/common/emailExportDialogBox";
import { statuses as DEAL_STATUSES } from "@/types/deals";

const DealsPage = () => {
  const {
    filteredDeals,
    loading,
    loadingMore,
    error,
    filters,
    hasNextPage,
    loadMore,
    dealStatsQuery,
    searchInput,
    setSearchInput,
    searchLoading,
    isModalOpen,
    selectedDeal,
    selectedDealIds,
    setSelectedDealIds,
    selectionResetKey,
    resetSelection,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isExportDialogOpen,
    setIsExportDialogOpen,
    exportEmail,
    setExportEmail,
    isSending,
    fetchDeals,
    handleEdit,
    handleDeleteDeal,
    confirmDelete,
    handleSave,
    handleCloseModal,
    handleExport,
    handleEmailExport,
    handleClearFilters,
    handleStageFilter,
  } = useDealsPageState();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Deals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your deals
          </p>
        </div>
      </div>

      <DealStatistics
        pipeline={dealStatsQuery.data?.pipeline ?? []}
        summary={dealStatsQuery.data?.summary ?? { totalPipelineValue: 0, totalDeals: 0, avgDealValue: 0 }}
        isLoading={dealStatsQuery.isLoading}
      />

      <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-50">
            {searchLoading ? (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            )}
            <Input
              placeholder="Search deals..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.stage || "all"}
            onValueChange={handleStageFilter}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {DEAL_STATUSES.map((stage) => (
                <SelectItem
                  key={stage}
                  value={stage}
                >
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="shrink-0"
          >
            Reset Filters
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
              {error?.message || "An error occurred"}
            </p>
            <Button
              onClick={fetchDeals}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns({
            onEdit: handleEdit,
            onDelete: handleDeleteDeal,
          })}
          data={filteredDeals}
          name="Deals"
          searchColumn="title"
          onSelectionChange={(rows) =>
            setSelectedDealIds(rows.map((r) => r._id))
          }
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
          resetSelectionTrigger={selectionResetKey}
        />
      )}

      <BulkActionBar
        selectedIds={selectedDealIds}
        entityType="deals"
        onClearSelection={resetSelection}
        exportHandler={handleExport}
        exportMailHandler={() => setIsExportDialogOpen(true)}
        onDeleteSuccess={fetchDeals}
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
