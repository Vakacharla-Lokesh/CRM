import { useCampaigns } from "@/hooks/useCampaigns";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Loader2, BarChart3, Clock } from "lucide-react";
import { STATUS_VARIANT } from "@/types/constants/campaign";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function CampaignHistory() {
  const { data: campaigns = [], isLoading } = useCampaigns();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Mail size={32} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium">No campaigns yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Compose your first campaign using the compose form
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalSent = campaigns.reduce((a, c) => a + c.totalRecipients, 0);
  const totalOpened = campaigns.reduce((a, c) => a + c.openCount, 0);
  const avgOpenRate =
    totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
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
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                {stat.icon}
                {stat.label}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="space-y-3">
        {campaigns.map((c) => {
          const openRate =
            c.totalRecipients > 0
              ? Math.round((c.openCount / c.totalRecipients) * 100)
              : 0;

          return (
            <Card key={c._id}>
              <CardContent className="pt-5 pb-3 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
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

                  <Badge
                    variant={STATUS_VARIANT[c.status] ?? "outline"}
                    className="capitalize"
                  >
                    {c.status}
                  </Badge>
                </div>

                {c.totalRecipients > 0 && (
                  <div className="pt-2">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${openRate}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="font-semibold tabular-nums">
                      {c.totalRecipients}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Sent
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold tabular-nums text-primary">
                      {c.openCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Opened
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold tabular-nums">
                      {c.totalRecipients > 0 ? `${openRate}%` : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default CampaignHistory;
