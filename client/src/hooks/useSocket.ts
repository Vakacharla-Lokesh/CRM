import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAppContext } from "./useAppContext";
import { useNotifications } from "../context/useNotificationContext";
import type { NotificationEventType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

interface NotificationPayload {
  type?: string;
  title?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const { user } = useAppContext();
  const { notifyEvent } = useNotifications();

  const queryClient = useQueryClient();

  const initializeSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    // Cancel any pending reconnect attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (!user) {
      console.warn("[Socket] Cannot connect: Missing auth credentials");
      return;
    }

    try {
      socketRef.current = io(SOCKET_SERVER_URL, {
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
      });

      // Events
      socketRef.current.on("socket:connected", (data) => {
        console.log("[Socket] Connected:", data);
        notifyEvent({
          type: "sync_completed",
          title: "Connected",
          message: "Real-time notifications enabled",
        });
      });

      socketRef.current.on(
        "notification:received",
        (notification: NotificationPayload) => {
          if (notification.metadata?.action === "lead:assigned") {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
          }

          notifyEvent({
            type: (notification.type || "message") as NotificationEventType,
            title: notification.title || "New Notification",
            message: notification.message,
            metadata: notification.metadata,
          });
        },
      );

      socketRef.current.on("reconnect_attempt", () => {
        console.log("[Socket] Attempting to reconnect...");
      });

      socketRef.current.on("reconnect", () => {
        console.log("[Socket] Reconnected");
        notifyEvent({
          type: "sync_completed",
          title: "Reconnected",
          message: "Real-time notifications restored",
        });
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("[Socket] Disconnected:", reason);
        if (
          reason !==
          ("io client namespace disconnect" as Socket.DisconnectReason)
        ) {
          notifyEvent({
            type: "offline_queued",
            title: "Offline",
            message: "Unable to reach notification server",
          });
        }
      });

      socketRef.current.on(
        "notification:received",
        (notification: NotificationPayload) => {
          if (notification.metadata?.action === "lead:assigned") {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
          }
        },
      );

      socketRef.current.on("connect_error", (error) => {
        console.error("[Socket] Connection error:", error);
      });

      socketRef.current.on("error:notification", (data) => {
        console.error("[Socket] Notification error:", data);
      });
    } catch (error) {
      console.error("[Socket] Initialization failed:", error);
    }
  }, [user, notifyEvent]);

  const sendMessage = useCallback(
    (message: string, type = "message", metadata?: Record<string, unknown>) => {
      if (!socketRef.current?.connected) {
        console.warn("[Socket] Cannot send message: socket not connected");
        return false;
      }
      try {
        socketRef.current.emit("message:send", {
          message,
          type,
          title: `Message from ${user?.firstName || "User"}`,
          metadata,
        });
        return true;
      } catch (error) {
        console.error("[Socket] Failed to send message:", error);
        return false;
      }
    },
    [user],
  );

  const triggerNotification = useCallback(
    (
      title: string,
      message: string,
      type = "message",
      metadata?: Record<string, unknown>,
    ) => {
      if (!socketRef.current?.connected) {
        console.warn(
          "[Socket] Socket not connected. Notification may not be delivered.",
        );
        return false;
      }
      try {
        socketRef.current.emit("notification:trigger", {
          title,
          message,
          type,
          metadata,
        });
        return true;
      } catch (error) {
        console.error("[Socket] Failed to trigger notification:", error);
        return false;
      }
    },
    [],
  );

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const getConnectionStatus = useCallback(
    () => socketRef.current?.connected ?? false,
    [],
  );
  const isConnected = getConnectionStatus;

  // Initialize when token and user exist
  useEffect(() => {
    if (user) initializeSocket();
  }, [user, initializeSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  // Disconnect socket on logout
  useEffect(() => {
    const handleLogout = () => {
      disconnect();
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [disconnect]);

  return {
    get socket() {
      return socketRef.current;
    },
    sendMessage,
    triggerNotification,
    disconnect,
    isConnected,
  };
}
