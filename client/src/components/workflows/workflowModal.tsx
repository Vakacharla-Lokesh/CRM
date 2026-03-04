import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type {
  Workflow,
  CreateWorkflowDTO,
  WorkflowAction,
  WorkflowTriggerEntity,
  WorkflowTriggerAction,
} from "@/types/workflows";
import { WorkflowBasicInfo } from "./workflowBasicInfo";
import { WorkflowTrigger } from "./workflowTrigger";
import { WorkflowActionsList } from "./workflowActionsList";

interface WorkflowModalProps {
  isOpen: boolean;
  workflow: Workflow | null;
  onClose: () => void;
  onSave: (data: CreateWorkflowDTO) => Promise<void>;
}

const emptyAction = (): WorkflowAction => ({ type: "send_email" });

const WorkflowModal = ({
  isOpen,
  workflow,
  onClose,
  onSave,
}: WorkflowModalProps) => {
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

  // Populate when editing
  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description ?? "");
      setIsActive(workflow.isActive);
      setTriggerEntity(workflow.trigger.entity);
      setTriggerAction(workflow.trigger.action);
      setActions(
        workflow.actions.length > 0 ? workflow.actions : [emptyAction()],
      );
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
      setTriggerEntity("lead");
      setTriggerAction("create");
      setActions([emptyAction()]);
    }
    setErrors({});
  }, [workflow, isOpen]);

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
        trigger: {
          entity: triggerEntity,
          action: triggerAction,
        },
        actions,
      };
      await onSave(data);
      onClose();
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workflow ? "Edit Workflow" : "Create Workflow"}
          </DialogTitle>
          <DialogDescription>
            Define a trigger and one or more actions to automate your CRM.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Info */}
          <WorkflowBasicInfo
            name={name}
            onNameChange={setName}
            description={description}
            onDescriptionChange={setDescription}
            isActive={isActive}
            onActiveChange={setIsActive}
            errors={errors}
          />

          {/* Trigger */}
          <WorkflowTrigger
            triggerEntity={triggerEntity}
            onEntityChange={setTriggerEntity}
            triggerAction={triggerAction}
            onActionChange={setTriggerAction}
          />

          {/* Actions */}
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : workflow ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowModal;
