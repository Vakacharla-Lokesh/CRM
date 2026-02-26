import { useState, useEffect } from "react";
import { useWorkflowData } from "@/hooks";
import { useDebounce } from "@/hooks";

import { DataTable } from "../components/common/dataTable";
import { columns } from "../components/workflows/workflowColumns";
import WorkflowModal from "../components/workflows/workflowModal";
import WorkflowLogsPanel from "../components/workflows/workflowLogsPanel";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Search, Plus, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks";

import type { Workflow, CreateWorkflowDTO } from "@/types/workflows";

const WorkflowsPage = () => {
  const {
    workflows,
    loading,
    loadingMore,
    error,
    hasNextPage,
    loadMore,
    searchWorkflows,
    createWorkflow,
    updateWorkflow,
    toggleWorkflow,
    deleteWorkflow,
    creating,
    updating,
  } = useWorkflowData();

  const { notifyEvent } = useNotifications();

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Logs panel state
  const [logsWorkflow, setLogsWorkflow] = useState<Workflow | null>(null);

  // Delete confirmation state
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Sync debounced search
  useEffect(() => {
    searchWorkflows(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleCreate = () => {
    setSelectedWorkflow(null);
    setIsModalOpen(true);
  };

  const handleEdit = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setWorkflowToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workflowToDelete) return;
    try {
      await deleteWorkflow(workflowToDelete);
      notifyEvent({
        type: "workflow_deleted",
        title: "Workflow Deleted",
        message: "A workflow has been deleted.",
        entityId: workflowToDelete,
        entityType: "workflow",
      });
      toast.success("Workflow deleted");
    } catch {
      toast.error("Failed to delete workflow");
    } finally {
      setWorkflowToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggle = (id: string) => {
    toggleWorkflow(id);
  };

  const handleSave = async (data: CreateWorkflowDTO) => {
    if (selectedWorkflow) {
      await updateWorkflow(selectedWorkflow._id, data);
      notifyEvent({
        type: "workflow_updated",
        title: "Workflow Updated",
        message: `The workflow "${data.name}" has been updated.`,
        entityType: "workflow",
      });
      toast.success("Workflow updated");
    } else {
      await createWorkflow(data);
      notifyEvent({
        type: "workflow_created",
        title: "Workflow Created",
        message: `The workflow "${data.name}" has been created.`,
        entityType: "workflow",
      });
      toast.success("Workflow created");
    }
  };

  const tableColumns = columns({
    onEdit: handleEdit,
    onDelete: handleDeleteRequest,
    onToggle: handleToggle,
    onViewLogs: setLogsWorkflow,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
            <p className="text-sm text-muted-foreground">
              Automate actions triggered by CRM events
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={creating || updating}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search workflows…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load workflows"}
        </p>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading workflows…</p>
      ) : (
        <DataTable
          columns={tableColumns}
          data={workflows}
          name="workflows"
          loadingMore={loadingMore}
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
        />
      )}

      {/* Create / Edit modal */}
      <WorkflowModal
        isOpen={isModalOpen}
        workflow={selectedWorkflow}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      {/* Execution logs panel */}
      <WorkflowLogsPanel
        workflow={logsWorkflow}
        onClose={() => setLogsWorkflow(null)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setWorkflowToDelete(null);
        }}
        title="Delete Workflow"
        description="Are you sure you want to delete this workflow? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
};

export default WorkflowsPage;
