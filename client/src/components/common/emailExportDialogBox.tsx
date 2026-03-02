import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function EmailExportDialogBox({
  isExportDialogOpen,
  setIsExportDialogOpen,
  exportEmail,
  setExportEmail,
  handleEmailExport,
  isSending,
}: {
  isExportDialogOpen: boolean;
  setIsExportDialogOpen: (open: boolean) => void;
  exportEmail: string;
  setExportEmail: (email: string) => void;
  handleEmailExport: () => void;
  isSending: boolean;
}) {
  return (
    <AlertDialog
      open={isExportDialogOpen}
      onOpenChange={setIsExportDialogOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Email Export</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the email address where you'd like the exported leads sent.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Input
            type="email"
            placeholder="you@example.com"
            value={exportEmail}
            onChange={(e) => setExportEmail(e.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setExportEmail("");
            }}
          >
            Cancel
          </AlertDialogCancel>

          <Button
            onClick={handleEmailExport}
            disabled={!exportEmail || isSending}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EmailExportDialogBox;
