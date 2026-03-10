import { Badge } from "@/components/ui/badge";
import type { LeadActivity, LeadActivityType } from "@/types";

// ─── Activity type display config ──────────────────────────────────────────
interface ActivityConfig {
  label: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  dotColor: string;
}

const ACTIVITY_CONFIG: Record<LeadActivityType, ActivityConfig> = {
  CREATED: {
    label: "Created",
    badgeVariant: "default",
    dotColor: "bg-blue-500",
  },
  UPDATED: {
    label: "Updated",
    badgeVariant: "secondary",
    dotColor: "bg-gray-400",
  },
  STATUS_CHANGED: {
    label: "Status Changed",
    badgeVariant: "outline",
    dotColor: "bg-purple-500",
  },
  SCORE_UPDATED: {
    label: "Score Updated",
    badgeVariant: "outline",
    dotColor: "bg-yellow-500",
  },
  COMMENT_ADDED: {
    label: "Comment Added",
    badgeVariant: "secondary",
    dotColor: "bg-green-500",
  },
  COMMENT_DELETED: {
    label: "Comment Deleted",
    badgeVariant: "destructive",
    dotColor: "bg-red-400",
  },
  CALL_ADDED: {
    label: "Call Logged",
    badgeVariant: "secondary",
    dotColor: "bg-teal-500",
  },
  CALL_DELETED: {
    label: "Call Deleted",
    badgeVariant: "destructive",
    dotColor: "bg-red-400",
  },
  ATTACHMENT_ADDED: {
    label: "Attachment Added",
    badgeVariant: "secondary",
    dotColor: "bg-indigo-500",
  },
  ATTACHMENT_REMOVED: {
    label: "Attachment Removed",
    badgeVariant: "destructive",
    dotColor: "bg-red-400",
  },
  CONVERTED_TO_DEAL: {
    label: "Converted to Deal",
    badgeVariant: "default",
    dotColor: "bg-emerald-500",
  },
};

// ─── Relative time formatter ────────────────────────────────────────────────
function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// ─── Component ──────────────────────────────────────────────────────────────
interface LeadActivityItemProps {
  activity: LeadActivity;
  isLast: boolean;
}

function LeadActivityItem({ activity, isLast }: LeadActivityItemProps) {
  const config = ACTIVITY_CONFIG[activity.type] ?? {
    label: activity.type,
    badgeVariant: "outline" as const,
    dotColor: "bg-gray-400",
  };

  const createdByName = activity.createdBy
    ? `${activity.createdBy.firstName} ${activity.createdBy.lastName ?? ""}`.trim()
    : null;

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full mt-1 shrink-0 ring-2 ring-background ${config.dotColor}`}
        />
        {!isLast && (
          <div className="w-px flex-1 bg-border mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Badge variant={config.badgeVariant} className="text-xs font-medium">
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(activity.createdAt)}
          </span>
        </div>

        {activity.description && (
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
            {activity.description}
          </p>
        )}

        {createdByName && (
          <p className="text-xs text-muted-foreground mt-1">
            by <span className="font-medium text-gray-700 dark:text-gray-300">{createdByName}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default LeadActivityItem;
