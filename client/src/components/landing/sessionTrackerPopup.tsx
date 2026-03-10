import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSessionTracker } from "@/hooks/useSessionTracker";

const POPUP_DELAY_MS = 1_000;

interface PublicTenant {
  _id: string;
  name: string;
}

export default function SessionTrackerPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tenants, setTenants] = useState<PublicTenant[]>([]);
  const [form, setForm] = useState({ firstName: "", email: "", tenantId: "" });
  const [loading, setLoading] = useState(false);

  // Generate a stable sessionId for this page visit
  const [sessionId] = useState(() => crypto.randomUUID());

  // Tracker is inactive until the visitor submits the form
  const { flush } = useSessionTracker({
    active: submitted,
    sessionId,
    tenantId: form.tenantId,
    visitorName: form.firstName || null,
    visitorEmail: form.email || null,
  });

  // Trigger popup after dwell time
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!submitted) setOpen(true);
    }, POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [submitted]);

  // Fetch public tenant list for dropdown
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
    fetch(`${baseUrl}/tenants/public`)
      .then((res) => res.json())
      .then((data) => setTenants(data.tenants ?? []))
      .catch((err) => console.error("[Popup] Failed to fetch tenants:", err));
  }, []);

  const handleSubmit = useCallback(async () => {
    const { firstName, email, tenantId } = form;
    if (!firstName.trim() || !email.trim() || !tenantId) return;

    setLoading(true);
    setSubmitted(true);
    setOpen(false);
    setLoading(false);

    // Immediately flush any events that may have buffered while the
    // popup was open (e.g. scroll depth before form submission)
    await flush();
  }, [form, flush]);

  if (submitted) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent
        className="sm:max-w-md"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Want a personalised demo?
          </DialogTitle>
          <DialogDescription style={{ color: "var(--muted-foreground)" }}>
            Drop your details and we'll reach out with a tour tailored to your
            team.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <Input
            placeholder="First name"
            value={form.firstName}
            onChange={(e) =>
              setForm((f) => ({ ...f, firstName: e.target.value }))
            }
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
          <Input
            placeholder="Work email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />

          <Select
            value={form.tenantId}
            onValueChange={(val) => setForm((f) => ({ ...f, tenantId: val }))}
          >
            <SelectTrigger
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <SelectValue placeholder="Select organisation" />
            </SelectTrigger>
            <SelectContent position="popper">
              {tenants.map((t) => (
                <SelectItem
                  key={t._id}
                  value={t._id}
                >
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleSubmit}
            disabled={
              !form.firstName.trim() ||
              !form.email.trim() ||
              !form.tenantId ||
              loading
            }
            className="w-full h-10"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {loading ? "Saving…" : "Get my demo →"}
          </Button>

          <p
            className="text-xs text-center"
            style={{ color: "var(--muted-foreground)" }}
          >
            No spam. We'll only reach out once.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
