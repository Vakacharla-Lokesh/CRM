import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import envConfig from "./envConfig.js";

let io;

export const initializeSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: envConfig.corsOrigin || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";
      const tokenMatch = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
      const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(
        token,
        envConfig.jwtSecret || "your-secret-key",
      );
      socket.userId = decoded.userId;
      socket.tenantId = decoded.tenantId;
      socket.role = decoded.role;

      // Cache tenant room for efficient broadcasting
      socket.tenantRoom = `tenant:${decoded.tenantId}`;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(
      `[Socket] User ${socket.userId} connected - Socket ID: ${socket.id}`,
    );

    // Join tenant-specific room
    socket.join(socket.tenantRoom);
    console.log(
      `[Socket] User ${socket.userId} joined room: ${socket.tenantRoom}`,
    );

    // Send welcome message
    socket.emit("socket:connected", {
      socketId: socket.id,
      userId: socket.userId,
      tenantId: socket.tenantId,
      message: "Successfully connected to notification server",
    });

    // Handle incoming messages and broadcast to tenant
    socket.on("message:send", (data, callback) => {
      try {
        const messageData = {
          ...data,
          senderId: socket.userId,
          senderSocketId: socket.id,
          senderTenantId: socket.tenantId,
          timestamp: new Date().toISOString(),
        };

        console.log(
          `[Socket] Message from user ${socket.userId} (${socket.id}):`,
          messageData,
        );

        // Acknowledge receipt of message to sender
        if (typeof callback === "function") {
          callback({ success: true, timestamp: messageData.timestamp });
        }

        // Broadcast to ALL users in the same tenant (including sender)
        const broadcastData = {
          type: data.type || "message",
          title: data.title || "New Message",
          message: data.message,
          senderId: socket.userId,
          senderName: data.senderName || null,
          timestamp: messageData.timestamp,
          metadata: data.metadata,
        };

        console.log(
          `[Socket] Broadcasting to room ${socket.tenantRoom}:`,
          broadcastData,
        );

        io.to(socket.tenantRoom).emit("notification:received", broadcastData);
      } catch (error) {
        console.error("[Socket] Error handling message:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: error.message });
        }
        socket.emit("error:notification", {
          error: "Failed to send message",
        });
      }
    });

    // Handle custom notifications from server to tenant
    socket.on("notification:trigger", (data, callback) => {
      try {
        const notificationData = {
          type: data.type,
          title: data.title,
          message: data.message,
          senderId: socket.userId,
          senderName: data.senderName || null,
          timestamp: new Date().toISOString(),
          metadata: data.metadata,
        };

        console.log(
          `[Socket] Notification trigger from user ${socket.userId}:`,
          notificationData,
        );

        // Acknowledge receipt to sender
        if (typeof callback === "function") {
          callback({ success: true, timestamp: notificationData.timestamp });
        }

        // Broadcast to all users in the same tenant
        io.to(socket.tenantRoom).emit(
          "notification:received",
          notificationData,
        );

        console.log(
          `[Socket] Broadcast notification to room ${socket.tenantRoom}`,
        );
      } catch (error) {
        console.error("[Socket] Error triggering notification:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: error.message });
        }
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(
        `[Socket] User ${socket.userId} disconnected - Socket ID: ${socket.id}`,
      );
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`[Socket] Error from user ${socket.userId}:`, error);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized. Call initializeSocketServer first.",
    );
  }
  return io;
};

export const broadcastToTenant = (tenantId, notification) => {
  if (!io) return;
  const tenantRoom = `tenant:${tenantId}`;
  io.to(tenantRoom).emit("notification:received", {
    ...notification,
    timestamp: new Date().toISOString(),
  });
  console.log(`[Socket] Broadcast to tenant ${tenantId}:`, notification);
};

export const notifyUser = (userId, notification) => {
  if (!io) return;
  const userRoom = `user:${userId}`;
  io.to(userRoom).emit("notification:received", {
    ...notification,
    timestamp: new Date().toISOString(),
  });
  console.log(`[Socket] Notification to user ${userId}:`, notification);
};
