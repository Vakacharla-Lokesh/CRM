import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type {
  Workflow,
  CreateWorkflowDTO,
  WorkflowAction,
  WorkflowActionType,
  WorkflowTriggerEntity,
  WorkflowTriggerAction,
} from "@/types/workflows";

interface WorkflowModalProps {
  isOpen: boolean;
  workflow: Workflow | null;
  onClose: () => void;
  onSave: (data: CreateWorkflowDTO) => Promise<void>;
}

const TRIGGER_ENTITIES: WorkflowTriggerEntity[] = [
  "lead",
  "deal",
  "organization",
  "call",
  "comment",
];

const TRIGGER_ACTIONS: WorkflowTriggerAction[] = ["create", "update", "delete"];

const ACTION_TYPES: { value: WorkflowActionType; label: string }[] = [
  { value: "send_email", label: "Send Email" },
  { value: "update_field", label: "Update Field" },
];

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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wf-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="wf-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Notify team on new lead"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wf-desc">Description</Label>
              <Textarea
                id="wf-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description…"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="wf-active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
              />
              <Label htmlFor="wf-active">Active</Label>
            </div>
          </div>

          {/* Trigger */}
          <div className="space-y-3 border rounded-lg p-4">
            <h3 className="text-sm font-semibold">Trigger</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Entity</Label>
                <Select
                  value={triggerEntity}
                  onValueChange={(v) =>
                    setTriggerEntity(v as WorkflowTriggerEntity)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_ENTITIES.map((e) => (
                      <SelectItem
                        key={e}
                        value={e}
                        className="capitalize"
                      >
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Action</Label>
                <Select
                  value={triggerAction}
                  onValueChange={(v) =>
                    setTriggerAction(v as WorkflowTriggerAction)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_ACTIONS.map((a) => (
                      <SelectItem
                        key={a}
                        value={a}
                        className="capitalize"
                      >
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Actions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAction}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Action
              </Button>
            </div>

            {errors.actions && (
              <p className="text-xs text-destructive">{errors.actions}</p>
            )}

            {actions.map((action, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    Action {i + 1}
                  </span>
                  {actions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAction(i)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select
                    value={action.type}
                    onValueChange={(v) =>
                      updateAction(i, { type: v as WorkflowActionType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map(({ value, label }) => (
                        <SelectItem
                          key={value}
                          value={value}
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic fields by type */}
                {action.type === "send_email" && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Recipient (e.g. ${lead.email})"
                      value={action.recipient ?? ""}
                      onChange={(e) =>
                        updateAction(i, { recipient: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Subject"
                      value={action.subject ?? ""}
                      onChange={(e) =>
                        updateAction(i, { subject: e.target.value })
                      }
                    />
                    <Textarea
                      placeholder="Body (HTML supported, use ${field} for values)"
                      value={action.body ?? ""}
                      onChange={(e) =>
                        updateAction(i, { body: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                )}

                {action.type === "update_field" && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Target field (e.g. leadStatus)"
                      value={action.targetField ?? ""}
                      onChange={(e) =>
                        updateAction(i, { targetField: e.target.value })
                      }
                    />
                    <Input
                      placeholder="New value"
                      value={
                        typeof action.value === "string" ? action.value : ""
                      }
                      onChange={(e) =>
                        updateAction(i, { value: e.target.value })
                      }
                    />
                  </div>
                )}

                {action.type === "webhook" && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Webhook URL"
                      value={action.webhookUrl ?? ""}
                      onChange={(e) =>
                        updateAction(i, { webhookUrl: e.target.value })
                      }
                    />
                    <Select
                      value={action.method ?? "POST"}
                      onValueChange={(v) =>
                        updateAction(i, { method: v as "POST" | "PUT" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {action.type === "export_s3" && (
                  <div className="space-y-2">
                    <Select
                      value={action.format ?? "json"}
                      onValueChange={(v) =>
                        updateAction(i, { format: v as "csv" | "json" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="S3 Bucket name"
                      value={action.bucket ?? ""}
                      onChange={(e) =>
                        updateAction(i, { bucket: e.target.value })
                      }
                    />
                    <Input
                      placeholder="S3 Prefix (e.g. exports/)"
                      value={action.prefix ?? ""}
                      onChange={(e) =>
                        updateAction(i, { prefix: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

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
