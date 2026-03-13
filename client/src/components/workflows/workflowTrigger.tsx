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
import { Zap, ArrowRight } from "lucide-react";

interface WorkflowTriggerProps {
  triggerEntity: WorkflowTriggerEntity;
  onEntityChange: (value: WorkflowTriggerEntity) => void;
  triggerAction: WorkflowTriggerAction;
  onActionChange: (value: WorkflowTriggerAction) => void;
}

const entityDescriptions: Record<string, string> = {
  lead: "Trigger when a lead is created, updated, or deleted",
  deal: "Trigger when a deal is created, updated, or deleted",
  organization: "Trigger when an organization is created, updated, or deleted",
  call: "Trigger when a call is created, updated, or deleted",
  comment: "Trigger when a comment is created, updated, or deleted",
};

const actionDescriptions: Record<string, string> = {
  create: "When a new record is created",
  update: "When a record is modified",
  delete: "When a record is removed",
};

export const WorkflowTrigger: React.FC<WorkflowTriggerProps> = ({
  triggerEntity,
  onEntityChange,
  triggerAction,
  onActionChange,
}) => {
  return (
    <div className="relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-accent/30 rounded-2xl pointer-events-none" />
      
      <div className="relative bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-lg">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">Trigger Configuration</h3>
            <p className="text-sm text-muted-foreground mt-1">Define what event should activate this workflow</p>
          </div>
        </div>

        {/* Trigger selector */}
        <div className="space-y-4">
          {/* Entity Selection */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-medium text-foreground">When this happens...</Label>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Step 1</span>
            </div>
            <Select
              value={triggerEntity}
              onValueChange={(v) => onEntityChange(v as WorkflowTriggerEntity)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_ENTITIES.map((e) => (
                  <SelectItem
                    key={e}
                    value={e}
                    className="capitalize text-sm"
                  >
                    <span className="font-medium capitalize">{e}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {entityDescriptions[triggerEntity]}
            </p>
          </div>

          {/* Arrow connector */}
          <div className="flex justify-center py-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-6 h-px bg-border" />
              <ArrowRight className="h-4 w-4" />
              <div className="w-6 h-px bg-border" />
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-medium text-foreground">Specifically when...</Label>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Step 2</span>
            </div>
            <Select
              value={triggerAction}
              onValueChange={(v) => onActionChange(v as WorkflowTriggerAction)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_ACTIONS.map((a) => (
                  <SelectItem
                    key={a}
                    value={a}
                    className="capitalize text-sm"
                  >
                    <span className="font-medium capitalize">{a}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {actionDescriptions[triggerAction]}
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-muted rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground font-medium">Trigger Preview:</p>
          <p className="text-sm font-medium text-foreground mt-1">
            <span className="text-primary capitalize">{triggerAction}</span>
            {" a "}
            <span className="text-primary capitalize">{triggerEntity}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
