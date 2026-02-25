import { useState, useCallback, type ReactNode } from "react";
import { NotificationContext } from "./useNotificationContext";
import type {
  AppNotification,
  NotifyEventPayload,
} from "@/types/notifications";

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const MAX_NOTIFICATIONS = 100;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

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
