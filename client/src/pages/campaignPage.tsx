import { useState } from "react";
import { useCampaigns, useCreateCampaign } from "@/hooks/useCampaigns";
import { useQuery } from "@tanstack/react-query";
import leadService from "@/services/leadService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Loader2 } from "lucide-react";

function LeadMultiSelect({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["leads-search-campaign", search],
    queryFn: () =>
      search.length >= 2
        ? leadService.searchLeads({ q: search, limit: 20 })
        : leadService.getAllLeads({ limit: 30 }),
    staleTime: 30_000,
  });

  const leads = data?.leads ?? [];

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search leads..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9"
      />
      <div className="border rounded-md max-h-52 overflow-y-auto divide-y">
        {leads.length === 0 && (
          <p className="text-sm text-muted-foreground px-3 py-4 text-center">
            No leads found
          </p>
        )}
        {leads.map((lead) => {
          const isSelected = selectedIds.includes(lead._id);
          return (
            <button
              key={lead._id}
              type="button"
              onClick={() => toggle(lead._id)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                isSelected
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              }`}
            >
              <span>
                {lead.firstName} {lead.lastName ?? ""}
                {lead.email && (
                  <span className="text-muted-foreground ml-2 text-xs">
                    {lead.email}
                  </span>
                )}
              </span>
              {isSelected && <span className="text-primary text-xs">✓</span>}
            </button>
          );
        })}
      </div>
      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} recipient{selectedIds.length !== 1 ? "s" : ""}{" "}
          selected
        </p>
      )}
    </div>
  );
}

function ComposeForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [leadIds, setLeadIds] = useState<string[]>([]);
  const [formKey, setFormKey] = useState(0);

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

  return (
    <div className="border rounded-xl p-6 space-y-5 bg-card">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Mail size={18} /> Compose Campaign
      </h2>

      <div className="space-y-1">
        <label className="text-sm font-medium">To (Recipients)</label>
        <LeadMultiSelect
          key={formKey}
          selectedIds={leadIds}
          onChange={setLeadIds}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Subject</label>
        <Input
          placeholder="Email subject..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Body (HTML supported)</label>
        <Textarea
          placeholder="Write your email body here..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="font-mono text-sm"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending || !subject || !body || leadIds.length === 0}
        className="w-full"
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
          : `Send to ${leadIds.length} Lead${leadIds.length !== 1 ? "s" : ""}`}
      </Button>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  draft: "secondary",
  queued: "outline",
  sending: "outline",
  completed: "default",
  failed: "destructive",
};

function CampaignHistory() {
  const { data: campaigns = [], isLoading } = useCampaigns();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12 border rounded-xl">
        No campaigns yet. Compose your first one above.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((c) => (
        <div
          key={c._id}
          className="border rounded-xl px-5 py-4 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors"
        >
          <div>
            <p className="font-medium text-sm">{c.subject}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(c.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="font-semibold">{c.totalRecipients}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-green-600">{c.openCount}</p>
              <p className="text-xs text-muted-foreground">Opened</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-blue-600">
                {c.totalRecipients > 0
                  ? `${Math.round((c.openCount / c.totalRecipients) * 100)}%`
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Open Rate</p>
            </div>
            <Badge
              variant={
                (STATUS_COLORS[c.status] as
                  | "default"
                  | "secondary"
                  | "outline"
                  | "destructive") ?? "outline"
              }
            >
              {c.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CampaignPage() {
  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Send tracked email campaigns to your leads
        </p>
      </div>

      <ComposeForm />

      <div>
        <h2 className="text-base font-semibold mb-3">Past Campaigns</h2>
        <CampaignHistory />
      </div>
    </div>
  );
}
