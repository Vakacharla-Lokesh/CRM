import { createContext, useContext } from "react";
import type { NotificationContextType } from "@/types/notifications";

export const NotificationContext =
  createContext<NotificationContextType | null>(null);

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return ctx;
};
