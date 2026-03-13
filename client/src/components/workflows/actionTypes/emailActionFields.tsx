import { Input } from "@/components/ui/input";
import MDEditor from "@uiw/react-md-editor";
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
        placeholder="Recipient email or {{lead.email}}"
        value={action.recipient ?? ""}
        onChange={(e) => onUpdate({ recipient: e.target.value })}
      />
      <Input
        placeholder="Subject"
        value={action.subject ?? ""}
        onChange={(e) => onUpdate({ subject: e.target.value })}
      />
      <div data-color-mode="auto">
        <MDEditor
          value={action.body ?? ""}
          onChange={(val) => onUpdate({ body: val ?? "" })}
          preview="edit"
          height={160}
          textareaProps={{
            placeholder: "Email body — use {{field}} for dynamic values",
          }}
        />
      </div>
    </div>
  );
};
