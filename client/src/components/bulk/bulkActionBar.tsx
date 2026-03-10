import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import { toast } from "sonner";
import { Download, Mail, Trash2, X } from "lucide-react";

import { useBulkDeleteLeads } from "@/hooks/leads/useBulkDeleteLeads";
import { useBulkDeleteOrganizations } from "@/hooks/organizations/useBulkDeleteOrganizations";
import { useBulkDeleteDeals } from "@/hooks/deals/useBulkDeleteDeals";

interface BulkActionBarProps {
  selectedIds: string[];
  entityType: "leads" | "organizations" | "deals";
  onClearSelection: () => void;
  exportHandler: () => void;
  exportMailHandler?: () => void;
  onDeleteSuccess?: () => void;
}

export function BulkActionBar({
  selectedIds,
  entityType,
  onClearSelection,
  exportHandler,
  exportMailHandler,
  onDeleteSuccess,
}: BulkActionBarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const leadsBulkDelete = useBulkDeleteLeads();
  const organizationsBulkDelete = useBulkDeleteOrganizations();
  const dealsBulkDelete = useBulkDeleteDeals();

  const getBulkDeleteHook = () => {
    switch (entityType) {
      case "leads":
        return leadsBulkDelete;
      case "organizations":
        return organizationsBulkDelete;
      case "deals":
        return dealsBulkDelete;
    }
  };

  const { bulkDelete, loading: deleteLoading } = getBulkDeleteHook();

  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);

  const handleDelete = async () => {
    try {
      const result = await bulkDelete(selectedIds);

      if (result.totalDeleted > 0) {
        toast.success(
          `Successfully deleted ${result.totalDeleted} ${entityType}`,
        );
      }

      if (result.failedIds.length > 0) {
        toast.warning(
          `${result.failedIds.length} ${entityType} could not be deleted`,
          {
            description:
              "Some records may not exist or you may not have permission.",
          },
        );
      }

      onClearSelection();
      onDeleteSuccess?.();
    } catch (error) {
      console.error(`Error bulk deleting ${entityType}:`, error);
      toast.error(`Failed to delete ${entityType}. Please try again.`);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div
        role="region"
        aria-label={`Bulk actions for ${entityType}`}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-full bg-card border border-border shadow-lg">
          {/* Selected count */}
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            {selectedIds.length} selected
          </span>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={exportHandler}
              className="flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            {exportMailHandler && (
              <Button
                size="sm"
                variant="outline"
                onClick={exportMailHandler}
                className="flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export to Mail</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteLoading}
              className="flex items-center gap-1.5"
            >
              {deleteLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {deleteLoading ? "Deleting..." : "Delete"}
              </span>
            </Button>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              className="flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span className="sr-only sm:not-sr-only">Clear</span>
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={`Delete ${selectedIds.length} ${entityLabel}`}
        description={`Are you sure you want to delete ${selectedIds.length} ${entityType}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}
