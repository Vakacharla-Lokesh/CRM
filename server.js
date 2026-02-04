import express from "express";
import cors from "cors";
import http from "http";
import { setupWebSocket } from "./services/communication/websockets/server.js";

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  }),
);
const server = http.createServer(app);
app.use(express.json());

// long polling code
let clients = [];
let latestMessage = null;

app.get("/poll", (req, res) => {
  if (latestMessage) {
    return res.json({ message: latestMessage });
  }

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });
});

app.post("/update", (req, res) => {
  latestMessage = req.body.message || "New message";

  clients.forEach((client) => client.json({ message: latestMessage }));

  clients = [];
  latestMessage = null;

  res.sendStatus(200);
});

// health check code
let healthRequests = [];
const RATE_LIMIT = 5;
const WINDOW_MS = 10_000;

app.get("/health", (req, res) => {
  const now = Date.now();
  healthRequests = healthRequests.filter((t) => now - t < WINDOW_MS);

  if (healthRequests.length >= RATE_LIMIT) {
    return res.status(429).json({
      status: "rate_limited",
      retryAfter: 2,
    });
  }

  healthRequests.push(now);

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

const INTERVAL_MS = 10007;

setInterval(async () => {
  try {
    const message = `New message at ${new Date().toISOString()}`;

    const response = await fetch("http://localhost:3000/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Message sent:", message);
  } catch (err) {
    console.error("Failed to send message:", err.message);
  }
}, INTERVAL_MS);

setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`HTTP + WebSocket running on http://localhost:${PORT}`);
});
