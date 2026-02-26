import { useLeadActivityData } from "@/hooks";
import LeadActivityItem from "./LeadActivityItem";
import { Activity } from "lucide-react";

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function ActivitySkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`activity-skeleton-${i}`}
          className="flex gap-4 animate-pulse"
        >
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: "var(--muted)" }} />
            {i < 3 && <div className="w-px flex-1 mt-1" style={{ backgroundColor: "var(--muted)" }} />}
          </div>
          <div className="pb-6 flex-1 space-y-2">
            <div className="flex gap-2 items-center">
              <div className="h-5 w-24 rounded-full" style={{ backgroundColor: "var(--muted)" }} />
              <div className="h-3 w-16 rounded" style={{ backgroundColor: "color-mix(in srgb, var(--muted) 60%, transparent)" }} />
            </div>
            <div className="h-4 rounded" style={{ backgroundColor: "color-mix(in srgb, var(--muted) 60%, transparent)" }} />
            <div className="h-3 w-1/3 rounded" style={{ backgroundColor: "color-mix(in srgb, var(--muted) 40%, transparent)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Activity className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No activity yet</p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Actions like creating, editing comments, logging calls, and uploading attachments will appear here.
      </p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
interface LeadActivityTimelineProps {
  leadId: string;
  enabled: boolean;
}

function LeadActivityTimeline({ leadId, enabled }: LeadActivityTimelineProps) {
  const { activities, loading, error } = useLeadActivityData(leadId, enabled);

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return <ActivitySkeleton />;
  }

  if (activities.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {activities.map((activity, index) => (
        <LeadActivityItem
          key={activity._id}
          activity={activity}
          isLast={index === activities.length - 1}
        />
      ))}
    </div>
  );
}

export default LeadActivityTimeline;
