import { ConfirmDialog } from "@/components/common/confirmDialog";
import type { Lead } from "@/types";

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  lead: Lead | null;
}

export function ConvertLeadDialog({
  open,
  onOpenChange,
  onConfirm,
  lead,
}: ConvertLeadDialogProps) {
  if (!lead) return null;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Convert to Deal"
      description={`Are you sure you want to convert "${lead.firstName} ${lead.lastName || ""}" to a deal?`}
      confirmText="Convert"
    />
  );
}
