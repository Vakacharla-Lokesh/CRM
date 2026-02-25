import { cn } from "@/lib/utils";
import type {
  AppNotification,
  NotificationEventType,
} from "@/types/notifications";
import {
  Bell,
  UserPlus,
  UserCog,
  UserX,
  ArrowUpRight,
  Briefcase,
  Trophy,
  ThumbsDown,
  Building2,
  Phone,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  CloudOff,
  X,
} from "lucide-react";

const NOTIFICATION_ICONS: Record<
  NotificationEventType,
  { icon: React.ElementType; color: string }
> = {
  // lead events
  lead_created: { icon: UserPlus, color: "text-emerald-500" },
  lead_updated: { icon: UserCog, color: "text-blue-500" },
  lead_deleted: { icon: UserX, color: "text-red-500" },
  lead_converted: { icon: ArrowUpRight, color: "text-purple-500" },
  // deal events
  deal_created: { icon: Briefcase, color: "text-emerald-500" },
  deal_updated: { icon: Briefcase, color: "text-blue-500" },
  deal_deleted: { icon: Briefcase, color: "text-red-500" },
  deal_won: { icon: Trophy, color: "text-yellow-500" },
  deal_lost: { icon: ThumbsDown, color: "text-red-500" },
  // organization events
  organization_created: { icon: Building2, color: "text-emerald-500" },
  organization_updated: { icon: Building2, color: "text-blue-500" },
  organization_deleted: { icon: Building2, color: "text-red-500" },
  // user events
  user_created: { icon: UserPlus, color: "text-emerald-500" },
  user_added: { icon: UserPlus, color: "text-emerald-500" },
  user_updated: { icon: UserCog, color: "text-blue-500" },
  user_deleted: { icon: UserX, color: "text-red-500" },
  // tenant events
  tenant_created: { icon: Building2, color: "text-emerald-500" },
  tenant_updated: { icon: Building2, color: "text-blue-500" },
  tenant_deleted: { icon: Building2, color: "text-red-500" },
  // activity events
  call_logged: { icon: Phone, color: "text-blue-500" },
  comment_added: { icon: MessageSquare, color: "text-indigo-500" },
  attachment_uploaded: { icon: Paperclip, color: "text-gray-500" },
  // sync/offline events
  sync_completed: { icon: CheckCircle2, color: "text-emerald-500" },
  sync_failed: { icon: AlertCircle, color: "text-red-500" },
  offline_queued: { icon: CloudOff, color: "text-orange-500" },
};

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function NotificationRow({
  notification,
  onRead,
  onRemove,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { icon: Icon, color } = NOTIFICATION_ICONS[notification.type] ?? {
    icon: Bell,
    color: "text-gray-500",
  };

  return (
    <div
      onClick={() => !notification.read && onRead(notification.id)}
      className={cn(
        "flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors group",
        !notification.read && "bg-blue-50/60 dark:bg-blue-950/20",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-background border border-border",
        )}
      >
        <Icon className={cn("w-3.5 h-3.5", color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p
            className={cn(
              "text-sm leading-snug truncate",
              notification.read
                ? "text-muted-foreground"
                : "text-foreground font-medium",
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          {formatTime(notification.timestamp)}
        </p>
      </div>

      {/* Actions (visible on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
        className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
