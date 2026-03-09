import { cn } from "@/lib/utils";
import { NOTIFICATION_ICONS } from "@/types/constants/notifications";
import type { AppNotification } from "@/types/notifications";
import { formatTime } from "@/utils/format";
import { Bell, X } from "lucide-react";

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
