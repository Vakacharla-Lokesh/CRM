import { useRef, useState, useEffect } from "react";
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
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  X,
  CheckCheck,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/useNotification";
import { useOffline } from "@/context/useOffline";
import type { AppNotification, NotificationEventType } from "@/types/notifications";
import { cn } from "@/lib/utils";

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const NOTIFICATION_ICONS: Record<
  NotificationEventType,
  { icon: React.ElementType; color: string }
> = {
  lead_created:       { icon: UserPlus,      color: "text-emerald-500" },
  lead_updated:       { icon: UserCog,       color: "text-blue-500"    },
  lead_deleted:       { icon: UserX,         color: "text-red-500"     },
  lead_converted:     { icon: ArrowUpRight,  color: "text-purple-500"  },
  deal_created:       { icon: Briefcase,     color: "text-emerald-500" },
  deal_updated:       { icon: Briefcase,     color: "text-blue-500"    },
  deal_deleted:       { icon: Briefcase,     color: "text-red-500"     },
  deal_won:           { icon: Trophy,        color: "text-yellow-500"  },
  deal_lost:          { icon: ThumbsDown,    color: "text-red-500"     },
  organization_created: { icon: Building2,  color: "text-emerald-500" },
  organization_updated: { icon: Building2,  color: "text-blue-500"    },
  user_added:         { icon: UserPlus,      color: "text-emerald-500" },
  user_updated:       { icon: UserCog,       color: "text-blue-500"    },
  call_logged:        { icon: Phone,         color: "text-blue-500"    },
  comment_added:      { icon: MessageSquare, color: "text-indigo-500"  },
  attachment_uploaded:{ icon: Paperclip,     color: "text-gray-500"    },
  sync_completed:     { icon: CheckCircle2,  color: "text-emerald-500" },
  sync_failed:        { icon: AlertCircle,   color: "text-red-500"     },
  offline_queued:     { icon: CloudOff,      color: "text-orange-500"  },
};

// ─── Timestamp formatter ──────────────────────────────────────────────────────

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60)        return "just now";
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)    return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

// ─── Offline Queue Status Card ────────────────────────────────────────────────

function OfflineQueueStatus() {
  const {
    queue,
    isSyncing,
    isOnline,
    lastSyncTime,
    syncQueue,
    getStats,
  } = useOffline();

  const stats = getStats();

  const handleSync = async () => {
    if (!isSyncing && isOnline) {
      await syncQueue();
    }
  };

  const statusColor = !isOnline
    ? "text-orange-500"
    : stats.pending > 0
    ? "text-yellow-500"
    : "text-emerald-500";

  const statusLabel = !isOnline
    ? "Offline"
    : isSyncing
    ? "Syncing…"
    : stats.pending > 0
    ? "Pending sync"
    : "All synced";

  return (
    <div className="px-3 py-2.5 bg-muted/50 rounded-lg mx-2 mb-1">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-orange-500" />
          )}
          <span className="text-xs font-semibold text-foreground">
            Offline Queue
          </span>
        </div>

        {/* Sync button */}
        {isOnline && stats.pending > 0 && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={cn("w-3 h-3", isSyncing && "animate-spin")}
            />
            Sync now
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{queue.length}</span>{" "}
          queued
        </span>
        {stats.failed > 0 && (
          <span className="text-red-500">
            <span className="font-medium">{stats.failed}</span> failed
          </span>
        )}
        <span className={cn("ml-auto font-medium", statusColor)}>
          {statusLabel}
        </span>
      </div>

      {/* Last sync */}
      {lastSyncTime && (
        <p className="text-[10px] text-muted-foreground mt-1">
          Last synced {formatTime(lastSyncTime)}
        </p>
      )}
    </div>
  );
}

// ─── Single Notification Row ──────────────────────────────────────────────────

function NotificationRow({
  notification,
  onRead,
  onRemove,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { icon: Icon, color } =
    NOTIFICATION_ICONS[notification.type] ?? {
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

// ─── Notification Panel ───────────────────────────────────────────────────────

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useNotifications();

  // Close panel when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div
      ref={panelRef}
      className="relative"
    >
      {/* ── Bell Trigger ── */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative"
      >
        <Bell className="h-[1.2rem] w-[1.2rem]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-0.5 rounded-full bg-red-500 text-[10px] text-white font-bold flex items-center justify-center leading-none shadow">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-90 max-h-130 flex flex-col bg-background border border-border rounded-xl shadow-xl z-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors px-1.5 py-1 rounded hover:bg-accent"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-1.5 py-1 rounded hover:bg-accent"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Offline Queue Status */}
          <div className="pt-2 shrink-0">
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Sync Status
            </p>
            <OfflineQueueStatus />
          </div>

          {/* Divider */}
          <div className="mx-3 my-1.5 border-t border-border shrink-0" />

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Inbox className="w-8 h-8 opacity-40" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <>
                <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent Activity
                </p>
                {notifications.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onRead={markAsRead}
                    onRemove={removeNotification}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
