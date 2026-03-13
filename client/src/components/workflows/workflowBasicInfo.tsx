import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import MDEditor from "@uiw/react-md-editor";

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
        <Label>Description</Label>
        <div data-color-mode="auto">
          <MDEditor
            value={description}
            onChange={(val) => onDescriptionChange(val ?? "")}
            preview="edit"
            height={120}
            textareaProps={{ placeholder: "Optional description…" }}
          />
        </div>
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
