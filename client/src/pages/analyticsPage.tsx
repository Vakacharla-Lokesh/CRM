/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserAnalyticsData } from "@/hooks/users/useUserAnalyticsData";
import AnalyticsGrid, {
  WidgetSkeleton,
} from "../components/analytics/AnalyticsGrid";
import AnalyticsEmptyState from "../components/analytics/AnalyticsEmptyState";
import ChartConfigModal from "../components/analytics/ChartConfigModal";
import type { Widget } from "../services/api/userAnalytics.api";
import { ConfirmDialog } from "@/components/common/confirmDialog";

function AnalyticsPage() {
  const { widgets, loading, error, saveDashboard, saving, refresh } =
    useUserAnalyticsData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | undefined>(
    undefined,
  );

  const openAddModal = useCallback(() => {
    setEditingWidget(undefined);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((widget: Widget) => {
    setEditingWidget(widget);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingWidget(undefined);
  }, []);

  const handleSaveWidget = useCallback(
    async (widgetData: Omit<Widget, "_id" | "data" | "createdAt">) => {
      let updatedLayout: Widget[];

      if (editingWidget?._id) {
        // Replace existing widget
        updatedLayout = widgets.map((w: Widget) =>
          w._id === editingWidget._id ? { ...w, ...widgetData } : { ...w },
        );
      } else {
        // Append new widget (no _id or data yet)
        updatedLayout = [...widgets, { ...widgetData } as Widget];
      }

      // Strip computed data before persisting
      await saveDashboard(
        updatedLayout.map(({ data: _d, ...rest }: Widget) => rest),
      );
    },
    [editingWidget, widgets, saveDashboard],
  );

  const handleDeleteWidget = useCallback(
    async (widgetId: string) => {
      const updatedLayout = widgets
        .filter((w: Widget) => w._id !== widgetId)
        .map(({ data: _d, ...rest }: Widget) => rest);
      await saveDashboard(updatedLayout);
    },
    [widgets, saveDashboard],
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState<string | null>(null);

  const openDeleteDialog = useCallback((widgetId: string) => {
    setWidgetToDelete(widgetId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!widgetToDelete) return;

    await handleDeleteWidget(widgetToDelete);

    setDeleteDialogOpen(false);
    setWidgetToDelete(null);
  }, [widgetToDelete, handleDeleteWidget]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Analytics
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Your personalised analytics workspace — customise charts and
            metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="analytics-refresh"
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            id="analytics-add-widget"
            onClick={openAddModal}
            disabled={saving}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="px-4 py-3 rounded-lg border text-sm"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--destructive) 10%, transparent)",
            borderColor: "var(--destructive)",
            color: "var(--destructive)",
          }}
        >
          <p className="font-medium">Error loading analytics</p>
          <p className="opacity-80">{error}</p>
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <div
          className="px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--primary) 10%, transparent)",
            color: "var(--primary)",
          }}
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Saving your layout…
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <WidgetSkeleton key={i} />
          ))}
        </div>
      ) : widgets.length === 0 ? (
        <AnalyticsEmptyState onAddWidget={openAddModal} />
      ) : (
        <AnalyticsGrid
          widgets={widgets}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
        />
      )}

      {/* Modal */}
      <ChartConfigModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSaveWidget}
        initialWidget={editingWidget}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Widget"
        description="Are you sure you want to delete this widget? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}

export default AnalyticsPage;
