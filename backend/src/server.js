import express from "express";
import cors from "cors";
import helmet from "helmet";

// ROUTES HANDLER
import authRoutes from "../routes/authRoutes.js";
import leadRoutes from "../routes/leadRoutes.js";

// DB
import "../db/initDb.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTE HANDLING
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

export { app };

export default app;
