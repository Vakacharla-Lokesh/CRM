// server/src/server.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import passport from "../config/passport.js";
import authRoutes from "../routes/authRoutes.js";

import leadRoutes from "../routes/leadRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import tenantRoutes from "../routes/tenantRoutes.js";
import organizationRoutes from "../routes/organizationRoutes.js";
import dealRoutes from "../routes/dealRoutes.js";
import callRoutes from "../routes/callRoutes.js";
import commentRoutes from "../routes/commentRoutes.js";
import attachmentRoutes from "../routes/attachmentRoutes.js";
import analyticsRoutes from "../routes/analyticsRoutes.js";
import bulkRoutes from "../routes/bulkRoutes.js";

import { errorHandler, notFound } from "../middlewares/errorHandler.js";

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
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(passport.initialize());

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

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

app.use(notFound);
app.use(errorHandler);

export { app };
export default app;
