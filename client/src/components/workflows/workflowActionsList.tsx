import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  EmailActionFields,
  UpdateFieldActionFields,
  WebhookActionFields,
  CreateTaskActionFields,
} from "./actionTypes";
import { ACTION_TYPES } from "./workflowUtils";
import type {
  WorkflowAction,
  WorkflowActionType,
  WorkflowTriggerEntity,
} from "@/types/workflows";

const EMPTY_ERRORS: Record<string, string> = {};

interface WorkflowActionsListProps {
  actions: WorkflowAction[];
  onAddAction: () => void;
  onRemoveAction: (index: number) => void;
  onUpdateAction: (index: number, patch: Partial<WorkflowAction>) => void;
  triggerEntity: WorkflowTriggerEntity;
  errors?: Record<string, string>;
}

export const WorkflowActionsList: React.FC<WorkflowActionsListProps> = ({
  actions,
  onAddAction,
  onRemoveAction,
  onUpdateAction,
  triggerEntity,
  errors = EMPTY_ERRORS,
}) => {
  const renderActionFields = (action: WorkflowAction, index: number) => {
    switch (action.type) {
      case "send_email":
        return (
          <EmailActionFields
            action={action}
            onUpdate={(patch) => onUpdateAction(index, patch)}
          />
        );
      case "update_field":
        return (
          <UpdateFieldActionFields
            action={action}
            onUpdate={(patch) => onUpdateAction(index, patch)}
          />
        );
      case "webhook":
        return (
          <WebhookActionFields
            action={action}
            onUpdate={(patch) => onUpdateAction(index, patch)}
            triggerEntity={triggerEntity}
            actionIndex={index}
          />
        );
      case "create_task":
        return (
          <CreateTaskActionFields
            action={action}
            onUpdate={(patch) => onUpdateAction(index, patch)}
            triggerEntity={triggerEntity}
            actionIndex={index}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Actions</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddAction}
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
                onClick={() => onRemoveAction(i)}
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
                onUpdateAction(i, { type: v as WorkflowActionType })
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

          {/* Render dynamic fields based on action type */}
          {renderActionFields(action, i)}
        </div>
      ))}
    </div>
  );
};
