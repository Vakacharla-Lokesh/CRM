import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkflowAction } from "@/types/workflows";

interface ExportS3ActionFieldsProps {
  action: WorkflowAction;
  onUpdate: (patch: Partial<WorkflowAction>) => void;
}

export const ExportS3ActionFields: React.FC<ExportS3ActionFieldsProps> = ({
  action,
  onUpdate,
}) => {
  return (
    <div className="space-y-2">
      <Select
        value={action.format ?? "json"}
        onValueChange={(v) => onUpdate({ format: v as "csv" | "json" })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="json">JSON</SelectItem>
          <SelectItem value="csv">CSV</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="S3 Bucket name"
        value={action.bucket ?? ""}
        onChange={(e) => onUpdate({ bucket: e.target.value })}
      />
      <Input
        placeholder="S3 Prefix (e.g. exports/)"
        value={action.prefix ?? ""}
        onChange={(e) => onUpdate({ prefix: e.target.value })}
      />
    </div>
  );
};
