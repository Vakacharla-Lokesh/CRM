import { useRef, useState, useEffect } from "react";
import { Bell, Trash2, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/useNotificationContext";

import { OfflineQueueStatus } from "@/components/common/offlineQueueStatus";
import { NotificationRow } from "@/components/common/notificationRow";

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
