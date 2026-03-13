import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { WorkflowBasicInfo } from "@/components/workflows/workflowBasicInfo";
import { WorkflowTrigger } from "@/components/workflows/workflowTrigger";
import { WorkflowActionsList } from "@/components/workflows/workflowActionsList";
import { useWorkflowData } from "@/hooks";
import { useNotifications } from "@/hooks";
import workflowService from "@/services/workflowService";
import { toast } from "sonner";
import type {
  WorkflowAction,
  WorkflowTriggerEntity,
  WorkflowTriggerAction,
  CreateWorkflowDTO,
} from "@/types/workflows";
import { ArrowLeft, GitBranch } from "lucide-react";

const emptyAction = (): WorkflowAction => ({ type: "send_email" });

const WorkflowFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { createWorkflow, updateWorkflow } = useWorkflowData();
  const { notifyEvent } = useNotifications();

  // Fetch existing workflow when editing
  const { data: existingWorkflow, isLoading: loadingWorkflow } = useQuery({
    queryKey: ["workflow", id],
    queryFn: () => workflowService.getWorkflowById(id!),
    enabled: isEdit,
    staleTime: 0,
  });

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [triggerEntity, setTriggerEntity] =
    useState<WorkflowTriggerEntity>("lead");
  const [triggerAction, setTriggerAction] =
    useState<WorkflowTriggerAction>("create");
  const [actions, setActions] = useState<WorkflowAction[]>([emptyAction()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (existingWorkflow) {
      setName(existingWorkflow.name);
      setDescription(existingWorkflow.description ?? "");
      setIsActive(existingWorkflow.isActive);
      setTriggerEntity(existingWorkflow.trigger.entity);
      setTriggerAction(existingWorkflow.trigger.action);
      setActions(
        existingWorkflow.actions.length > 0
          ? existingWorkflow.actions
          : [emptyAction()],
      );
    }
  }, [existingWorkflow]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.trim().length < 3)
      newErrors.name = "Name must be at least 3 characters";
    if (actions.length === 0)
      newErrors.actions = "At least one action is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data: CreateWorkflowDTO = {
        name: name.trim(),
        description: description.trim() || undefined,
        isActive,
        trigger: { entity: triggerEntity, action: triggerAction },
        actions,
      };

      if (isEdit && id) {
        await updateWorkflow(id, data);
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

      navigate("/workflows");
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error
            ? err.message
            : "Failed to save. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAction = () => setActions((prev) => [...prev, emptyAction()]);
  const removeAction = (i: number) =>
    setActions((prev) => prev.filter((_, idx) => idx !== i));
  const updateAction = (i: number, patch: Partial<WorkflowAction>) =>
    setActions((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    );

  if (isEdit && loadingWorkflow) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading workflow…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/workflows")}
          aria-label="Back to workflows"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <GitBranch className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Edit Workflow" : "New Workflow"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <WorkflowBasicInfo
          name={name}
          onNameChange={setName}
          description={description}
          onDescriptionChange={setDescription}
          isActive={isActive}
          onActiveChange={setIsActive}
          errors={errors}
        />

        <WorkflowTrigger
          triggerEntity={triggerEntity}
          onEntityChange={setTriggerEntity}
          triggerAction={triggerAction}
          onActionChange={setTriggerAction}
        />

        <WorkflowActionsList
          actions={actions}
          onAddAction={addAction}
          onRemoveAction={removeAction}
          onUpdateAction={updateAction}
          triggerEntity={triggerEntity}
          errors={errors}
        />

        {errors.submit && (
          <p className="text-sm text-destructive">{errors.submit}</p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/workflows")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkflowFormPage;
