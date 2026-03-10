import { useCampaigns } from "@/hooks/useCampaigns";
import { Badge } from "@/components/ui/badge";

import { Mail, Send, Loader2, BarChart3, Clock } from "lucide-react";

import { STATUS_VARIANT } from "@/types/constants/campaign";

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
      <div className="border rounded-xl py-16 text-center">
        <Mail
          size={32}
          className="mx-auto text-muted-foreground/30 mb-3"
        />
        <p className="text-sm font-medium text-muted-foreground">
          No campaigns yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Compose your first campaign using the form above
        </p>
      </div>
    );
  }

  const totalSent = campaigns.reduce((a, c) => a + c.totalRecipients, 0);
  const totalOpened = campaigns.reduce((a, c) => a + c.openCount, 0);
  const avgOpenRate =
    totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Campaigns",
            value: campaigns.length,
            icon: <Mail size={14} />,
          },
          {
            label: "Emails Sent",
            value: totalSent.toLocaleString(),
            icon: <Send size={14} />,
          },
          {
            label: "Avg. Open Rate",
            value: `${avgOpenRate}%`,
            icon: <BarChart3 size={14} />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border rounded-xl p-3 bg-card"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              {stat.icon}
              {stat.label}
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {campaigns.map((c) => {
          const openRate =
            c.totalRecipients > 0
              ? Math.round((c.openCount / c.totalRecipients) * 100)
              : 0;

          return (
            <div
              key={c._id}
              className="border rounded-xl px-5 py-4 bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{c.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-5 text-sm shrink-0">
                  <div className="text-center">
                    <p className="font-semibold tabular-nums">
                      {c.totalRecipients}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Sent
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {c.openCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Opened
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                      {c.totalRecipients > 0 ? `${openRate}%` : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Rate
                    </p>
                  </div>
                  <Badge
                    variant={STATUS_VARIANT[c.status] ?? "outline"}
                    className="capitalize"
                  >
                    {c.status}
                  </Badge>
                </div>
              </div>

              {c.totalRecipients > 0 && (
                <div className="mt-3">
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${openRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CampaignHistory;
