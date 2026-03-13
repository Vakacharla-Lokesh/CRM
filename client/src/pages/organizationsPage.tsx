import { useOrganizationsPageState } from "@/hooks/organizations/useOrganizationsPageState";
import { DataTable } from "@/components/common/dataTable";
import { columns } from "@/components/organizations/organizationColumns";
import { Button } from "@/components/ui/button";
import { Import, Search } from "lucide-react";
import { BulkActionBar } from "@/components/bulk/bulkActionBar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizationModal } from "@/components/modals";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import OrganizationStatistics from "@/components/organizations/organizationStatistics";
import BulkImportModal from "@/components/modals/bulkImportModal";
import EmailExportDialogBox from "@/components/common/emailExportDialogBox";
import { ORGANIZATION_INDUSTRIES } from "@/types/interfaces/form-interfaces";

const OrganizationsPage = () => {
  const {
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
    orgStatsQuery,
    selectedOrganization,
    selectedOrganizationIds,
    setSelectedOrganizationIds,
    selectionResetKey,
    resetSelection,
    isModalOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    searchInput,
    setSearchInput,
    isOnline,
    queue,
    isExportDialogOpen,
    setIsExportDialogOpen,
    exportEmail,
    setExportEmail,
    isSending,
    isImportModalOpen,
    setIsImportModalOpen,
    importOrganizations,
    importOrgLoading,
    handleAddOrganization,
    handleCloseModal,
    handleSaveOrganization,
    handleEditOrganization,
    handleDeleteOrganization,
    confirmDelete,
    handleViewLeads,
    handleExport,
    handleEmailExport,
    handleBulkImport,
  } = useOrganizationsPageState();

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
            onClick={handleAddOrganization}
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add Organization
          </Button>
        </div>
      </div>

      <OrganizationStatistics
        stats={orgStatsQuery.data?.stats ?? []}
        isLoading={orgStatsQuery.isLoading}
      />

      <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search organizations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.industry || "all"}
            onValueChange={(value) =>
              updateFilter("industry", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-44">
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

          <Button
            variant="outline"
            onClick={resetFilters}
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
          searchColumn="name"
          onSelectionChange={(rows) =>
            setSelectedOrganizationIds(rows.map((r) => r._id))
          }
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
          resetSelectionTrigger={selectionResetKey}
        />
      )}

      <BulkActionBar
        selectedIds={selectedOrganizationIds}
        entityType="organizations"
        onClearSelection={resetSelection}
        exportHandler={handleExport}
        exportMailHandler={() => setIsExportDialogOpen(true)}
        onDeleteSuccess={fetchOrganizations}
      />

      <OrganizationModal
        key={selectedOrganization?._id ?? "new"}
        isOpen={isModalOpen}
        organization={selectedOrganization}
        onClose={handleCloseModal}
        onSave={handleSaveOrganization}
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

      <EmailExportDialogBox
        isExportDialogOpen={isExportDialogOpen}
        setIsExportDialogOpen={setIsExportDialogOpen}
        exportEmail={exportEmail}
        setExportEmail={setExportEmail}
        handleEmailExport={handleEmailExport}
        isSending={isSending}
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Organizations"
        columns={[
          { name: "name", required: true },
          { name: "industry" },
          { name: "website" },
          { name: "size" },
          { name: "phone" },
          { name: "email" },
          { name: "address" },
        ]}
        importFn={importOrganizations}
        loading={importOrgLoading}
      />
    </div>
  );
};

export default OrganizationsPage;
