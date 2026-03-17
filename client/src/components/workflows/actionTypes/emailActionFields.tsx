import { Input } from "@/components/ui/input";
import { ThemedMDEditor } from "@/components/ui/mdEditor";
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
        placeholder="Recipient email address"
        value={action.recipient ?? ""}
        onChange={(e) => onUpdate({ recipient: e.target.value })}
      />
      <Input
        placeholder="Subject"
        value={action.subject ?? ""}
        onChange={(e) => onUpdate({ subject: e.target.value })}
      />
      <ThemedMDEditor
        value={action.body ?? ""}
        onChange={(val) => onUpdate({ body: val ?? "" })}
        preview="edit"
        height={160}
        placeholder="Email body"
      />
    </div>
  );
};
