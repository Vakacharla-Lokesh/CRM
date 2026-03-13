import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, AlertCircle } from "lucide-react";

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
    <div className="relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-secondary/20 rounded-2xl pointer-events-none" />
      
      <div className="relative bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-secondary rounded-lg">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">Workflow Details</h3>
            <p className="text-sm text-muted-foreground mt-1">Set up basic information for your workflow</p>
          </div>
        </div>

        {/* Workflow Name */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="wf-name" className="text-sm font-medium text-foreground">
              Workflow Name <span className="text-destructive">*</span>
            </Label>
            {errors.name && (
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            )}
          </div>
          <Input
            id="wf-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Notify team on new lead"
            className={errors.name ? "border-destructive bg-destructive/5" : ""}
          />
          {errors.name && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label htmlFor="wf-description" className="text-sm font-medium text-foreground">
            Description <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="wf-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add additional context about what this workflow does and when it should be used..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Active toggle */}
        <div className="bg-muted rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="wf-active"
                checked={isActive}
                onCheckedChange={(checked) => onActiveChange(!!checked)}
              />
              <div>
                <Label 
                  htmlFor="wf-active" 
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Activate Workflow
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {isActive 
                    ? "This workflow is currently active and will trigger based on defined events."
                    : "This workflow is inactive and won't execute any actions."
                  }
                </p>
              </div>
            </div>
            <div className={`h-2 w-2 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/30"}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
