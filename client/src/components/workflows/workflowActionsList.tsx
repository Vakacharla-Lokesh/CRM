import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmailActionFields,
  CreateTaskActionFields,
} from "./actionTypes";
import { ACTION_TYPES } from "./workflowUtils";
import type {
  WorkflowAction,
  WorkflowActionType,
  WorkflowTriggerEntity,
} from "@/types/workflows";
import { Zap, AlertCircle } from "lucide-react";

const EMPTY_ERRORS: Record<string, string> = {};

interface WorkflowActionsListProps {
  actions: WorkflowAction[];
  onUpdateAction: (index: number, patch: Partial<WorkflowAction>) => void;
  triggerEntity: WorkflowTriggerEntity;
  errors?: Record<string, string>;
}

export const WorkflowActionsList: React.FC<WorkflowActionsListProps> = ({
  actions,
  onUpdateAction,
  triggerEntity,
  errors = EMPTY_ERRORS,
}) => {
  const action = actions[0];

  if (!action) {
    return null;
  }

  const renderActionFields = (currentAction: WorkflowAction) => {
    switch (currentAction.type) {
      case "send_email":
        return (
          <EmailActionFields
            action={currentAction}
            onUpdate={(patch) => onUpdateAction(0, patch)}
          />
        );
      case "create_task":
        return (
          <CreateTaskActionFields
            action={currentAction}
            onUpdate={(patch) => onUpdateAction(0, patch)}
            triggerEntity={triggerEntity}
            actionIndex={0}
          />
        );
      default:
        return null;
    }
  };

  const getActionDescription = (type: WorkflowActionType): string => {
    switch (type) {
      case "send_email":
        return "Send an email notification";
      case "webhook":
        return "Send data to Slack or external service";
      case "create_task":
        return "Automatically create a task";
      default:
        return "Select an action type";
    }
  };

  return (
    <div className="relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-accent/20 rounded-2xl pointer-events-none" />
      
      <div className="relative bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-lg">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">Workflow Actions</h3>
            <p className="text-sm text-muted-foreground mt-1">Define what should happen when the trigger activates</p>
          </div>
        </div>

        {errors.actions && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{errors.actions}</p>
          </div>
        )}

        {/* Action Type Selection */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <Label className="text-sm font-medium text-foreground">Action Type</Label>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Step 3</span>
          </div>
          <Select
            value={action.type}
            onValueChange={(v) =>
              onUpdateAction(0, { type: v as WorkflowActionType })
            }
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map(({ value, label }) => (
                <SelectItem
                  key={value}
                  value={value}
                  className="text-sm"
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {getActionDescription(action.type)}
          </p>
        </div>

        {/* Dynamic action fields */}
        <div className="border-t border-border pt-6">
          <div className="space-y-4">
            {renderActionFields(action)}
          </div>
        </div>
      </div>
    </div>
  );
};
