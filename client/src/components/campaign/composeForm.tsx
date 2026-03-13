import { useCreateCampaign } from "@/hooks/useCampaigns";
import { Loader2, Send, X } from "lucide-react";
import RecipientsPicker from "./recipientsPicker";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ThemedMDEditor } from "../ui/mdEditor";

interface ComposeFormProps {
  subject: string;
  setSubject: (value: string) => void;
  body: string;
  setBody: (value: string) => void;
  leadIds: string[];
  setLeadIds: (ids: string[]) => void;
  onSuccess?: () => void;
}

function ComposeForm({
  subject,
  setSubject,
  body,
  setBody,
  leadIds,
  setLeadIds,
  onSuccess,
}: ComposeFormProps) {
  const { mutate: createCampaign, isPending } = useCreateCampaign();

  const handleSubmit = () => {
    if (!subject.trim() || !body.trim() || leadIds.length === 0) return;
    createCampaign(
      { subject, body, leadIds },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  const isFormValid = subject.trim() && body.trim() && leadIds.length > 0;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Recipients Field */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">
          Recipients
        </label>
        <RecipientsPicker
          selectedIds={leadIds}
          onChange={setLeadIds}
        />
        {leadIds.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {leadIds.length} recipient{leadIds.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div className="space-y-3">
        <label
          htmlFor="subject"
          className="block text-sm font-semibold text-foreground"
        >
          Subject Line
        </label>
        <div className="relative">
          <Input
            id="subject"
            placeholder="Enter email subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="pr-10 h-10"
          />
          {subject && (
            <button
              type="button"
              onClick={() => setSubject("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear subject"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {subject && (
          <p className="text-xs text-muted-foreground">
            {subject.length} characters
          </p>
        )}
      </div>

      {/* Body Field */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label
            htmlFor="body"
            className="block text-sm font-semibold text-foreground"
          >
            Email Body
          </label>
        </div>
        <ThemedMDEditor
          value={body}
          onChange={(val) => setBody(val ?? "")}
          height={280}
          preview="edit"
          visibleDragbar={false}
          disabled={isPending}
        />
        {body && (
          <p className="text-xs text-muted-foreground">
            {body.length} characters
          </p>
        )}
      </div>

      {/* Send Button */}
      <div className="pt-4 w-full justify-end items-center">
        <Button
          onClick={handleSubmit}
          disabled={isPending || !isFormValid}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2
                size={16}
                className="animate-spin mr-2"
              />
              Sending...
            </>
          ) : (
            <>
              <Send
                size={16}
                className="mr-2"
              />
              {isFormValid
                ? `Send to ${leadIds.length} Lead${leadIds.length !== 1 ? "s" : ""}`
                : "Complete the email to send"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default ComposeForm;
