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
          placeholder="Follow up with a lead"
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
          placeholder="Remember to mention any relevant details here."
          value={action.taskDescription || ""}
          onChange={(e) => onUpdate({ taskDescription: e.target.value })}
          rows={3}
          className="font-mono text-sm"
        />
      </div>

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
    </div>
  );
};
