import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ROUTE HANDLING - API Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);

// STATIC FILES - Serve frontend static files
const frontendPath = path.join(__dirname, "../../frontend");
app.use(express.static(frontendPath));

// FRONTEND ROUTES - Serve index.html for all non-API routes (SPA routing)
app.get("*", (req, res) => {
  // Skip API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

export { app };

export default app;
