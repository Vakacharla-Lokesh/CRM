import { DataTable } from "../components/common/dataTable";
import { columns } from "../components/deals/dealColumns";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDealData } from "@/hooks";
import { DealModal } from "@/components/modals";
import type { Deal, UpdateDealDTO, DealStatus } from "@/types";
import { useState } from "react";

const DealsPage = () => {
  const {
    filteredDeals,
    statistics,
    loading,
    error,
    filters,
    updateFilter,
    clearFilters,
    updateDeal,
    deleteDeal,
  } = useDealData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);

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
    } catch (error) {
      console.error("Error deleting deal:", error);
      alert("Failed to delete deal. Please try again.");
    } finally {
      setDealToDelete(null);
    }
  };

  const handleSave = async (dealData: UpdateDealDTO) => {
    if (!selectedDeal) return;
    
    try {
      await updateDeal(selectedDeal._id, dealData);
      setIsModalOpen(false);
      setSelectedDeal(null);
    } catch (error) {
      console.error("Error updating deal:", error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDeal(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Deals
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {statistics.total}
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Value
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(statistics.totalValue)}
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Value</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {formatCurrency(statistics.avgValue)}
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Forecast</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {formatCurrency(statistics.forecastValue)}
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Won</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {statistics.byStage.closed_won || 0}
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
                placeholder="Search deals..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={filters.stage || "all"}
            onValueChange={(value) =>
              updateFilter("stage", value === "all" ? "" : (value as DealStatus))
            }
          >
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="Filter by Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Prospecting">Prospecting</SelectItem>
              <SelectItem value="Qualification">Qualification</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Ready to close">Ready to close</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={
              !filters.search &&
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
          searchColumn="dealName"
        ></DataTable>
      )}

      <DealModal
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
    </div>
  );
};

export default DealsPage;
