import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WorkflowAction } from "@/types/workflows";

interface EmailActionFieldsProps {
  action: WorkflowAction;
  onUpdate: (patch: Partial<WorkflowAction>) => void;
}

export const EmailActionFields: React.FC<EmailActionFieldsProps> = ({
  action,
  onUpdate,
}) => {
  return (
    <div className="space-y-2">
      <Input
        placeholder="Recipient (e.g. ${lead.email})"
        value={action.recipient ?? ""}
        onChange={(e) => onUpdate({ recipient: e.target.value })}
      />
      <Input
        placeholder="Subject"
        value={action.subject ?? ""}
        onChange={(e) => onUpdate({ subject: e.target.value })}
      />
      <Textarea
        placeholder="Body (HTML supported, use ${field} for values)"
        value={action.body ?? ""}
        onChange={(e) => onUpdate({ body: e.target.value })}
        rows={3}
      />
    </div>
  );
};
