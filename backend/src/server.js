import express from "express";
import cors from "cors";
import helmet from "helmet";

// ROUTES HANDLER
import authRoutes from "../routes/authRoutes.js";
import leadRoutes from "../routes/leadRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import tenantRoutes from "../routes/tenantRoutes.js";
import organizationRoutes from "../routes/organizationRoutes.js";
import dealRoutes from "../routes/dealRoutes.js";
import callRoutes from "../routes/callRoutes.js";
import commentRoutes from "../routes/commentRoutes.js";
import attachmentRoutes from "../routes/attachmentRoutes.js";

// MIDDLEWARES
import { errorHandler, notFound } from "../middlewares/errorHandler.js";

// DB
import "../db/initDb.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  }),
);
app.use(express.json({ limit: "10mb" })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ROUTE HANDLING
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);

// ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

export { app };

export default app;
