import express from "express";
import cors from "cors";
import helmet from "helmet";
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

app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for frontend
}));
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

// FRONTEND ROUTES - Serve complete HTML pages from pages folder
const pageRoutes = {
  "/home": "home.html",
  "/leads": "leads.html",
  "/organizations": "organizations.html",
  "/deals": "deals.html",
  "/leadDetails": "leadDetailPage.html",
  "/login": "login.html",
  "/signup": "signup.html",
  "/users": "users.html",
  "/tenants": "tenants.html",
};

Object.entries(pageRoutes).forEach(([route, htmlFile]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(frontendPath, "pages", htmlFile));
  });
});

// Root route - serve index.html for authenticated area
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

export { app };

export default app;
