import { useLeadsPageState } from "@/hooks/leads/useLeadsPageState";
import { DataTable } from "../components/common/dataTable";
import { columns } from "../components/leads/leadColumns";
import { Button } from "../components/ui/button";
import { Import, Search } from "lucide-react";
import { BulkActionBar } from "@/components/bulk/bulkActionBar";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { LeadModal, PipelineModal } from "@/components/modals";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import LeadStatistics from "@/components/leads/leadStatistics";
import BulkImportModal from "@/components/modals/bulkImportModal";
import { LEAD_SOURCES } from "@/types/interfaces/form-interfaces";
import { PipelineFilter } from "@/components/leads/pipelineFilter";
import EmailExportDialogBox from "@/components/common/emailExportDialogBox";
import type { PipelineSegment } from "@/types/leads";

const RFM_SEGMENTS: PipelineSegment[] = [
  "Hot Deals",
  "Sleeping Giants",
  "Time Wasters",
  "Dead Wood",
  "Active Prospect",
  "Unsegmented",
];

const LeadsPage = () => {
  const {
    filteredLeads,
    loading,
    loadingMore,
    error,
    filters,
    fetchLeads,
    hasNextPage,
    loadMore,
    leadStatsQuery,
    searchInput,
    setSearchInput,
    searchLoading,
    pipelines,
    pipelinesLoading,
    selectedPipelineId,
    setSelectedPipelineId,
    pipelineStatuses,
    updateFilter,
    isPipelineModalOpen,
    setIsPipelineModalOpen,
    selectedPipelineForEdit,
    setSelectedPipelineForEdit,
    isModalOpen,
    selectedLead,
    selectedLeadIds,
    setSelectedLeadIds,
    selectionResetKey,
    resetSelection,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isOnline,
    queue,
    isExportDialogOpen,
    setIsExportDialogOpen,
    exportEmail,
    setExportEmail,
    isSending,
    isImportModalOpen,
    setIsImportModalOpen,
    importLeads,
    importLoading,
    handleAddLead,
    handleEditLead,
    handleDeleteLead,
    confirmDelete,
    handleSaveLead,
    handleCloseModal,
    handleCreatePipeline,
    handleEditPipeline,
    handleSavePipeline,
    handleResetFilters,
    handleExport,
    handleEmailExport,
    handleBulkImport,
    handleRunSegmentation,
    isSegmenting,
    segmentCooldown,
  } = useLeadsPageState();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your leads
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
            onClick={handleBulkImport}
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Import />
            Import
          </Button>
          <Button
            onClick={handleAddLead}
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add Lead
          </Button>
        </div>
      </div>

      <LeadStatistics
        breakdown={leadStatsQuery.data?.breakdown ?? []}
        total={leadStatsQuery.data?.total ?? 0}
        isLoading={leadStatsQuery.isLoading}
      />

      <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">
        {/* Row 1 — Search */}
        <div className="relative w-full">
          {searchLoading ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}

          <Input
            placeholder="Search leads..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Row 2 — Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <PipelineFilter
            selectedPipelineId={selectedPipelineId || undefined}
            pipelines={pipelines}
            onSelect={(id) => {
              setSelectedPipelineId(id);
              updateFilter("pipelineId", id);
              updateFilter("status", "");
            }}
            onCreateClick={handleCreatePipeline}
            onEditClick={handleEditPipeline}
            isLoading={pipelinesLoading}
          />

          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              updateFilter("status", value === "all" ? "" : value)
            }
            disabled={pipelineStatuses.length === 0}
          >
            <SelectTrigger className="w-35">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {pipelineStatuses.map((stage) => (
                <SelectItem
                  key={stage.label}
                  value={stage.label}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    {stage.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.source || "all"}
            onValueChange={(value) =>
              updateFilter("source", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-35">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {LEAD_SOURCES.map((source) => (
                <SelectItem
                  key={source.value}
                  value={source.value}
                >
                  {source.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.rfmSegment || "all"}
            onValueChange={(value) =>
              updateFilter("rfmSegment", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All segments</SelectItem>
              {RFM_SEGMENTS.map((seg) => (
                <SelectItem
                  key={seg}
                  value={seg}
                >
                  {seg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleRunSegmentation}
            disabled={isSegmenting || segmentCooldown > 0}
            className="shrink-0 gap-2"
          >
            {isSegmenting ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>✦</span>
            )}
            {isSegmenting
              ? "Segmenting…"
              : segmentCooldown > 0
                ? `Wait ${segmentCooldown}s`
                : "Segment Leads"}
          </Button>

          <Button
            variant="outline"
            onClick={handleResetFilters}
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
            <p className="text-gray-600 dark:text-gray-400">Loading leads...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Failed to load leads
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {error?.message || "An error occurred"}
            </p>
            <Button
              onClick={fetchLeads}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns({
            onEdit: handleEditLead,
            onDelete: handleDeleteLead,
          })}
          data={filteredLeads}
          name="Leads"
          searchColumn="email"
          onSelectionChange={(rows) =>
            setSelectedLeadIds(rows.map((r) => r._id))
          }
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
          resetSelectionTrigger={selectionResetKey}
        />
      )}

      <BulkActionBar
        selectedIds={selectedLeadIds}
        entityType="leads"
        onClearSelection={resetSelection}
        exportHandler={handleExport}
        exportMailHandler={() => setIsExportDialogOpen(true)}
        onDeleteSuccess={fetchLeads}
      />

      <LeadModal
        key={selectedLead?._id ?? "new"}
        isOpen={isModalOpen}
        lead={selectedLead}
        onClose={handleCloseModal}
        onSave={handleSaveLead}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
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

      <PipelineModal
        isOpen={isPipelineModalOpen}
        pipeline={selectedPipelineForEdit}
        onClose={() => {
          setIsPipelineModalOpen(false);
          setSelectedPipelineForEdit(undefined);
        }}
        onSave={handleSavePipeline}
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Leads"
        columns={[
          { name: "firstName", required: true },
          { name: "lastName" },
          { name: "email" },
          { name: "status" },
          { name: "source" },
          { name: "score" },
          { name: "assignedTo" },
        ]}
        importFn={importLeads}
        loading={importLoading}
      />
    </div>
  );
};

export default LeadsPage;
