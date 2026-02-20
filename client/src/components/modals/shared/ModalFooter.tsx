import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface ModalFooterProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel?: string;
  loadingLabel?: string;
}

export function ModalFooter({
  onCancel,
  isSubmitting,
  submitLabel,
  cancelLabel = "Cancel",
  loadingLabel = "Saving...",
}: ModalFooterProps) {
  return (
    <DialogFooter className="gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>{loadingLabel}</span>
          </div>
        ) : (
          <span>{submitLabel}</span>
        )}
      </Button>
    </DialogFooter>
  );
}
