import { Input } from "@/components/ui/input";
import type { WorkflowAction } from "@/types/workflows";

interface UpdateFieldActionFieldsProps {
  action: WorkflowAction;
  onUpdate: (patch: Partial<WorkflowAction>) => void;
}

export const UpdateFieldActionFields: React.FC<
  UpdateFieldActionFieldsProps
> = ({ action, onUpdate }) => {
  return (
    <div className="space-y-2">
      <Input
        placeholder="Target field (e.g. status)"
        value={action.targetField ?? ""}
        onChange={(e) => onUpdate({ targetField: e.target.value })}
      />
      <Input
        placeholder="New value"
        value={typeof action.value === "string" ? action.value : ""}
        onChange={(e) => onUpdate({ value: e.target.value })}
      />
    </div>
  );
};
