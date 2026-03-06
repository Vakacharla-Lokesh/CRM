import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { VariablePicker } from "../variablePicker";
import type { WorkflowAction, WorkflowTriggerEntity } from "@/types/workflows";

interface CreateTaskActionFieldsProps {
  action: WorkflowAction;
  onUpdate: (patch: Partial<WorkflowAction>) => void;
  triggerEntity: WorkflowTriggerEntity;
  actionIndex: number;
}

export const CreateTaskActionFields: React.FC<CreateTaskActionFieldsProps> = ({
  action,
  onUpdate,
  triggerEntity,
  actionIndex,
}) => {
  const relationFromTrigger = action.taskRelationFromTrigger ?? true;
  const triggerIsRelatable = ["lead", "deal", "organization"].includes(
    triggerEntity,
  );

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="space-y-1">
        <Label htmlFor={`task-title-${actionIndex}`}>
          Task Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`task-title-${actionIndex}`}
          placeholder="Follow up with {{leadName}}"
          value={action.taskTitle || ""}
          onChange={(e) => onUpdate({ taskTitle: e.target.value })}
          className="font-mono text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor={`task-desc-${actionIndex}`}>Description</Label>
        <Textarea
          id={`task-desc-${actionIndex}`}
          placeholder="Call {{firstName}} at {{email}} regarding their enquiry."
          value={action.taskDescription || ""}
          onChange={(e) => onUpdate({ taskDescription: e.target.value })}
          rows={3}
          className="font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Priority */}
        <div className="space-y-1">
          <Label>Priority</Label>
          <Select
            value={action.taskPriority || "medium"}
            onValueChange={(v) =>
              onUpdate({ taskPriority: v as WorkflowAction["taskPriority"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div className="space-y-1">
          <Label htmlFor={`task-due-${actionIndex}`}>Due Date</Label>
          <Input
            id={`task-due-${actionIndex}`}
            placeholder="e.g. {{dueDate}} or 2025-12-31"
            value={action.taskDueDate || ""}
            onChange={(e) => onUpdate({ taskDueDate: e.target.value })}
            className="font-mono text-sm"
          />
        </div>
      </div>

      {/* Assign To */}
      <div className="space-y-1">
        <Label htmlFor={`task-assignee-${actionIndex}`}>
          Assign To (User ID)
        </Label>
        <Input
          id={`task-assignee-${actionIndex}`}
          placeholder="User ID or leave blank for unassigned"
          value={action.taskAssignedTo || ""}
          onChange={(e) => onUpdate({ taskAssignedTo: e.target.value })}
        />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3 shrink-0" />
          Leave blank to create unassigned. Paste a User ID to auto-assign.
        </p>
      </div>

      {/* Relation — link to triggering entity automatically */}
      {triggerIsRelatable && (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label className="text-sm">
              Link to triggering {triggerEntity}
            </Label>
            <p className="text-xs text-muted-foreground">
              Task will be automatically linked to the {triggerEntity} that
              fired this workflow
            </p>
          </div>
          <Switch
            checked={relationFromTrigger}
            onCheckedChange={(v) => onUpdate({ taskRelationFromTrigger: v })}
          />
        </div>
      )}

      {/* Variable Picker */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Available Variables (click to insert into title or description)
        </Label>
        <VariablePicker
          entityType={triggerEntity}
          onCopy={(variable) => {
            // Append to title if it's empty, otherwise to description
            if (!action.taskTitle) {
              onUpdate({ taskTitle: `{{${variable}}}` });
            } else {
              onUpdate({
                taskDescription:
                  (action.taskDescription || "") + `{{${variable}}}`,
              });
            }
          }}
        />
      </div>
    </div>
  );
};
