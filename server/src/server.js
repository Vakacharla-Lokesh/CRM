import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import envConfig from "./config/envConfig.js";

// passport js for authentication
import passport from "./config/passport.js";
import { requestContextMiddleware } from "./middlewares/requestContext.js";
import { initializeSocketServer } from "./config/socketServer.js";

// Routes
import authRoutes from "./modules/auth/routes/authRoutes.js";
import leadRoutes from "./modules/leads/routes/leadRoutes.js";
import userRoutes from "./modules/users/routes/userRoutes.js";
import tenantRoutes from "./modules/tenants/routes/tenantRoutes.js";
import organizationRoutes from "./modules/organizations/routes/organizationRoutes.js";
import dealRoutes from "./modules/deals/routes/dealRoutes.js";
import callRoutes from "./modules/calls/routes/callRoutes.js";
import commentRoutes from "./modules/comments/routes/commentRoutes.js";
import attachmentRoutes from "./modules/attachments/routes/attachmentRoutes.js";
import analyticsRoutes from "./modules/analytics/routes/analyticsRoutes.js";
import bulkRoutes from "./modules/bulk/routes/bulkRoutes.js";
import exportRoutes from "./modules/exports/routes/exportRoutes.js";
import workflowRoutes from "./modules/workflows/routes/workflowRoutes.js";
import userAnalyticsRoutes from "./modules/analytics/routes/userAnalyticsRoutes.js";
import statsRoutes from "./modules/analytics/routes/statsRoutes.js";
import taskRoutes from "./modules/tasks/routes/taskRoutes.js";
import jobRoutes from "./modules/jobs/routes/jobRoutes.js";
import pipelineRoutes from "./modules/pipelines/routes/pipelineRoutes.js";
import campaignRoutes from "./modules/campaign/routes/campaignRoutes.js";
import sessionEventRoutes from "./modules/sessionEvents/routes/sessionEventRoutes.js";

// error handler middlewares
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

// mongodb connection
import "./config/initDb.js";

// rate limiter function
import { rateLimitMiddleware } from "./middlewares/rateLimit.js";

// redis caching file
import "./config/redis.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocketServer(httpServer);

// Security Package for express
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// cookie parser
app.use(cookieParser());

// uuid generator middleware
app.use(requestContextMiddleware);

// Custom Morgan tokens
morgan.token("request-id", (req) => req.requestId ?? "-");
morgan.token("user-id", (req) => req.auth?.userId?.toString() ?? "-");

// Request logger for express
app.use(
  morgan(
    envConfig.isProduction
      ? '{"time":":date[iso]","method":":method","url":":url","status":":status","ms":":response-time","requestId":":request-id","userId":":user-id"}'
      : ":method :url :status :response-time ms — :request-id",
  ),
);

// Cors package to handle request from frontend
app.use(
  cors({
    origin: envConfig.corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// passport.js implementation for authentication
app.use(passport.initialize());

// rate limiter package for express
app.use(rateLimitMiddleware);

// health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// route handlers
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/bulk", bulkRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/user-analytics", userAnalyticsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/pipelines", pipelineRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/session-events", sessionEventRoutes);

// unknown route handler
app.use(notFound);

// error handler middleware
app.use(errorHandler);

export { app, httpServer };
export default httpServer;
