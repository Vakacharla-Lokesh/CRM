import { useState, useCallback, type ReactNode } from "react";
import { NotificationContext } from "./useNotification";
import type {
  AppNotification,
  NotifyEventPayload,
} from "@/types/notifications";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const MAX_NOTIFICATIONS = 100;

/**
 * Wrap your app (or authenticated subtree) with NotificationProvider.
 *
 * Then call `notifyEvent` anywhere to fire a notification:
 * @example
 * const { notifyEvent } = useNotifications();
 * notifyEvent({
 *   type: "lead_created",
 *   title: "New Lead",
 *   message: "John Doe was added as a lead.",
 *   entityId: lead._id,
 *   entityType: "leads",
 * });
 */
export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Add a new notification
  const notifyEvent = useCallback((payload: NotifyEventPayload) => {
    const notification: AppNotification = {
      id: generateId(),
      type: payload.type,
      title: payload.title,
      message: payload.message,
      timestamp: new Date(),
      read: false,
      entityId: payload.entityId,
      entityType: payload.entityType,
      metadata: payload.metadata,
    };

    setNotifications((prev) => {
      // Prepend newest first; cap to MAX_NOTIFICATIONS
      const updated = [notification, ...prev];
      return updated.slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notifyEvent,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
