import { useCreateCampaign } from "@/hooks/useCampaigns";
import {
  ChevronRight,
  LayoutTemplate,
  Loader2,
  Mail,
  Send,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import TemplateGallery from "./templateGallery";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LeadMultiSelect from "./leadMultiSelect";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

function ComposeForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [leadIds, setLeadIds] = useState<string[]>([]);
  const [formKey, setFormKey] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);

  const { mutate: createCampaign, isPending } = useCreateCampaign();

  const resetForm = () => {
    setSubject("");
    setBody("");
    setLeadIds([]);
    setFormKey((k) => k + 1);
  };

  const handleSubmit = () => {
    if (!subject.trim() || !body.trim() || leadIds.length === 0) return;
    createCampaign({ subject, body, leadIds }, { onSuccess: resetForm });
  };

  const applyTemplate = (tSubject: string, tBody: string) => {
    setSubject(tSubject);
    setBody(tBody);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-4">
      {/* Template gallery collapsible */}
      <div className="border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <LayoutTemplate
              size={15}
              className="text-muted-foreground"
            />
            Start from a template
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              Optional
            </Badge>
          </span>
          <ChevronRight
            size={14}
            className={`text-muted-foreground transition-transform ${
              showTemplates ? "rotate-90" : ""
            }`}
          />
        </button>

        {showTemplates && (
          <div className="border-t p-4 bg-muted/20">
            <TemplateGallery onSelect={applyTemplate} />
          </div>
        )}
      </div>

      {/* Compose card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail size={16} />
            Compose Campaign
          </CardTitle>
          <CardDescription>
            Fill in the details below and choose your recipients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Users size={13} />
              To (Recipients)
            </label>
            <LeadMultiSelect
              key={formKey}
              selectedIds={leadIds}
              onChange={setLeadIds}
            />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Subject</label>
            <div className="relative">
              <Input
                placeholder="Email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="pr-8"
              />
              {subject && (
                <button
                  type="button"
                  onClick={() => setSubject("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Body</label>
              {body && (
                <button
                  type="button"
                  onClick={() => setBody("")}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X size={10} /> Clear
                </button>
              )}
            </div>
            <Textarea
              placeholder="Write your email body here... (HTML supported)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="font-mono text-sm resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending || !subject || !body || leadIds.length === 0}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <Loader2
                size={16}
                className="animate-spin mr-2"
              />
            ) : (
              <Send
                size={16}
                className="mr-2"
              />
            )}
            {isPending
              ? "Queueing..."
              : leadIds.length > 0
                ? `Send to ${leadIds.length} Lead${leadIds.length !== 1 ? "s" : ""}`
                : "Send Campaign"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComposeForm;
