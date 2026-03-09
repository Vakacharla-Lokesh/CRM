import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const EMPTY_ERRORS: Record<string, string> = {};

interface WorkflowBasicInfoProps {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  isActive: boolean;
  onActiveChange: (checked: boolean) => void;
  errors?: Record<string, string>;
}

export const WorkflowBasicInfo: React.FC<WorkflowBasicInfoProps> = ({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  isActive,
  onActiveChange,
  errors = EMPTY_ERRORS,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wf-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="wf-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
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
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Optional description…"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="wf-active"
          checked={isActive}
          onCheckedChange={(checked) => onActiveChange(!!checked)}
        />
        <Label htmlFor="wf-active">Active</Label>
      </div>
    </div>
  );
};
