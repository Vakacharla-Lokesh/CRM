import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  WorkflowTriggerEntity,
  WorkflowTriggerAction,
} from "@/types/workflows";
import {
  TRIGGER_ENTITIES,
  TRIGGER_ACTIONS,
} from "./workflowUtils";

interface WorkflowTriggerProps {
  triggerEntity: WorkflowTriggerEntity;
  onEntityChange: (value: WorkflowTriggerEntity) => void;
  triggerAction: WorkflowTriggerAction;
  onActionChange: (value: WorkflowTriggerAction) => void;
}

export const WorkflowTrigger: React.FC<WorkflowTriggerProps> = ({
  triggerEntity,
  onEntityChange,
  triggerAction,
  onActionChange,
}) => {
  return (
    <div className="space-y-3 border rounded-lg p-4">
      <h3 className="text-sm font-semibold">Trigger</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Entity</Label>
          <Select
            value={triggerEntity}
            onValueChange={(v) => onEntityChange(v as WorkflowTriggerEntity)}
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
            onValueChange={(v) => onActionChange(v as WorkflowTriggerAction)}
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
  );
};
