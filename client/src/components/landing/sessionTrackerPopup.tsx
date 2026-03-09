import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
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
import { v4 as uuidv4 } from "uuid";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
const POPUP_DELAY_MS = 1_000;

interface PublicTenant {
  _id: string;
  name: string;
}

interface SessionTrackerPopupProps {
  onSessionStart?: (socket: Socket, sessionId: string) => void;
}

export default function SessionTrackerPopup({
  onSessionStart,
}: SessionTrackerPopupProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tenants, setTenants] = useState<PublicTenant[]>([]);
  const [form, setForm] = useState({ firstName: "", email: "", tenantId: "" });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = useCallback(() => {
    const { firstName, email, tenantId } = form;
    if (!firstName.trim() || !email.trim() || !tenantId) return;

    setLoading(true);

    const sessionId = uuidv4();

    const trackingSocket = io(`${SOCKET_URL}/tracking`, {
      query: {
        sessionId,
        tenantId,
        visitorName: firstName,
        visitorEmail: email,
      },
      transports: ["websocket", "polling"],
    });

    trackingSocket.on("connect", () => {
      console.log("[Tracking] Connected to /tracking namespace");

      // Emit initial page_enter event
      trackingSocket.emit("session:event", {
        type: "page_enter",
        data: {},
        timestamp: new Date().toISOString(),
      });
    });

    trackingSocket.on("connect_error", (err) => {
      console.error("[Tracking] Connection error:", err.message);
    });

    setSubmitted(true);
    setOpen(false);
    setLoading(false);

    onSessionStart?.(trackingSocket, sessionId);
  }, [form, onSessionStart]);

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
            onFocus={() => {}}
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
            {loading ? "Connecting…" : "Get my demo →"}
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
