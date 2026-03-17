import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface WebhookActionFieldsProps {
  action: WorkflowAction;
  onUpdate: (patch: Partial<WorkflowAction>) => void;
  triggerEntity: WorkflowTriggerEntity;
  actionIndex: number;
}

export const WebhookActionFields: React.FC<WebhookActionFieldsProps> = ({
  action,
  onUpdate,
  triggerEntity,
  actionIndex,
}) => {
  return (
    <div className="space-y-3">
      {/* Webhook URL */}
      <div className="space-y-2">
        <Label htmlFor={`webhook-url-${actionIndex}`}>
          Slack Webhook URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`webhook-url-${actionIndex}`}
          placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
          value={action.webhookUrl || ""}
          onChange={(e) => onUpdate({ webhookUrl: e.target.value })}
        />
        <p className="text-xs text-muted-foreground flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          <span>
            Get your webhook URL from Slack: Workspace Settings → Apps →
            Incoming Webhooks → Add New Webhook
          </span>
        </p>
      </div>

      {/* Message Template */}
      <div className="space-y-2">
        <Label htmlFor={`message-template-${actionIndex}`}>
          Message Template
        </Label>
        <Textarea
          id={`message-template-${actionIndex}`}
          placeholder={`🚀 New {{entityType}} Created!\n\nName: {{leadName}}\nEmail: {{email}}\nCreated by: {{createdBy.fullName}}`}
          value={action.messageTemplate || ""}
          onChange={(e) => onUpdate({ messageTemplate: e.target.value })}
          rows={5}
          className="font-mono text-sm"
        />
      </div>

      {/* Available Variables */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          Available Variables (click to copy)
        </Label>
        <VariablePicker
          entityType={triggerEntity}
          onCopy={(variable) => {
            const currentTemplate = action.messageTemplate || "";
            const newTemplate = currentTemplate + `{{${variable}}}`;
            onUpdate({ messageTemplate: newTemplate });
          }}
        />
      </div>

      {/* HTTP Method */}
      <div className="space-y-2">
        <Label htmlFor={`webhook-method-${actionIndex}`}>HTTP Method</Label>
        <Select
          value={action.method || "POST"}
          onValueChange={(v) => onUpdate({ method: v as "POST" | "PUT" })}
        >
          <SelectTrigger id={`webhook-method-${actionIndex}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
