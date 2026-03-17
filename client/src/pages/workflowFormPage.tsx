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
import { ArrowLeft, GitBranch, AlertCircle } from "lucide-react";

const emptyAction = (): WorkflowAction => ({ type: "send_email" });
const normalizeAction = (action: WorkflowAction): WorkflowAction => {
  const normalized = { ...(action as WorkflowAction & {
    taskDueDate?: string;
  }) };
  delete normalized.taskDueDate;
  return normalized;
};

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
          ? [normalizeAction(existingWorkflow.actions[0])]
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
        actions: [normalizeAction(actions[0] ?? emptyAction())],
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
    <div className="min-h-screen bg-background">
      <div className="p-6 mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/workflows")}
              aria-label="Back to workflows"
              className="hover:bg-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {isEdit ? "Edit Workflow" : "Create New Workflow"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {isEdit 
                    ? "Update your workflow configuration"
                    : "Set up a new automation workflow to save time and improve consistency"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Step 1: Basic Info */}
          <WorkflowBasicInfo
            name={name}
            onNameChange={setName}
            description={description}
            onDescriptionChange={setDescription}
            isActive={isActive}
            onActiveChange={setIsActive}
            errors={errors}
          />

          {/* Step 2: Trigger */}
          <WorkflowTrigger
            triggerEntity={triggerEntity}
            onEntityChange={setTriggerEntity}
            triggerAction={triggerAction}
            onActionChange={setTriggerAction}
          />

          {/* Step 3: Actions */}
          <WorkflowActionsList
            actions={actions}
            onUpdateAction={updateAction}
            triggerEntity={triggerEntity}
            errors={errors}
          />

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-destructive">Failed to save workflow</h4>
                <p className="text-sm text-destructive/80 mt-1">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end pt-6 border-t border-border">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/workflows")}
                disabled={isSubmitting}
                className="min-w-24"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-24"
              >
                {isSubmitting ? "Saving…" : isEdit ? "Update Workflow" : "Create Workflow"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkflowFormPage;
