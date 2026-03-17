// component imports
import { DataTable } from "@/components/common/dataTable";
import { columns } from "@/components/tenants/tenantColumns";
import { Button } from "@/components/ui/button";
import { TenantModal } from "@/components/modals";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import TenantStatistics from "@/components/tenants/tenantStatistics";

// other imports
import { Plus, Search } from "lucide-react";

// notification imports

import { useTenantPageState } from "@/hooks/tenants/useTenantPageState";

const TenantsPage = () => {
  const {
    tenantsStats,
    statsLoading,
    isOnline,
    isModalOpen,
    selectedTenant,
    deleteDialogOpen,
    searchInput,
    setSearchInput,
    handleSaveTenant,
    handleOpenModal,
    handleEditTenant,
    handleDeleteTenant,
    confirmDelete,
    viewUsersOfTenant,
    searchLoading,
    // extra state/ops returned from hook
    clearFilters,
    filters,
    loading,
    error,
    filteredTenants,
    hasNextPage,
    loadMore,
    loadingMore,
    setIsModalOpen,
    setSelectedTenant,
    setDeleteDialogOpen,
  } = useTenantPageState();

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
      <TenantStatistics
        statistics={tenantsStats}
        isLoading={statsLoading}
      />

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
          searchColumn="name"
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
        ></DataTable>
      )}

      <TenantModal
        key={selectedTenant?._id ?? "new"}
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
