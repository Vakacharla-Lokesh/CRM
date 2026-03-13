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

// Exponential backoff with jitter configuration
const RETRY_CONFIG = {
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  maxAttempts: 10,
  backoffMultiplier: 2,
  jitterFactor: 0.1, // 10% jitter
};

// Calculate retry delay with exponential backoff and jitter
function calculateRetryDelay(attemptNumber: number): number {
  const exponentialDelay = Math.min(
    RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attemptNumber),
    RETRY_CONFIG.maxDelay,
  );

  // Add jitter (random variance) to prevent thundering herd
  const jitterRange = exponentialDelay * RETRY_CONFIG.jitterFactor;
  const jitter = Math.random() * jitterRange - jitterRange / 2;

  return Math.max(exponentialDelay + jitter, RETRY_CONFIG.initialDelay);
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
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
        // Use manual reconnection strategy with exponential backoff + jitter
        reconnection: false, // Disable automatic reconnection
        transports: ["websocket", "polling"],
      });

      // Events
      socketRef.current.on("socket:connected", (data) => {
        console.log("[Socket] Connected:", data);
        retryCountRef.current = 0; // Reset retry count on successful connection
        notifyEvent({
          type: "sync_completed",
          title: "Connected",
          message: "Real-time notifications enabled",
        });
      });

      socketRef.current.on(
        "notification:received",
        (notification: NotificationPayload) => {
          // Invalidate leads query when a lead is assigned
          if (
            notification.metadata?.action === "lead:assigned" ||
            notification.type === "lead_assigned"
          ) {
            console.log("[Socket] Invalidating leads - lead assigned notification");
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
        console.log(
          `[Socket] Attempting to reconnect... (Attempt ${retryCountRef.current + 1}/${RETRY_CONFIG.maxAttempts})`,
        );
      });

      socketRef.current.on("reconnect", () => {
        console.log("[Socket] Reconnected");
        retryCountRef.current = 0; // Reset retry count on successful reconnection
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

          // Implement custom retry with exponential backoff + jitter
          if (retryCountRef.current < RETRY_CONFIG.maxAttempts && user) {
            const delay = calculateRetryDelay(retryCountRef.current);
            console.log(
              `[Socket] Scheduling reconnect in ${Math.round(delay)}ms (Attempt ${retryCountRef.current + 1})`,
            );

            reconnectTimeoutRef.current = window.setTimeout(() => {
              retryCountRef.current++;
              console.log(
                `[Socket] Retrying connection (Attempt ${retryCountRef.current}/${RETRY_CONFIG.maxAttempts})`,
              );
              if (socketRef.current) {
                socketRef.current.connect();
              }
            }, delay);
          } else if (retryCountRef.current >= RETRY_CONFIG.maxAttempts) {
            console.error(
              `[Socket] Max reconnection attempts (${RETRY_CONFIG.maxAttempts}) reached. Giving up.`,
            );
            notifyEvent({
              type: "error",
              title: "Connection Failed",
              message: "Unable to establish connection after multiple attempts",
            });
          }
        }
      });

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
