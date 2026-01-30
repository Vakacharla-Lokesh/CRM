import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:5000" }));
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

  clients.forEach((client) =>
    client.json({ message: latestMessage })
  );

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
  healthRequests = healthRequests.filter(
    (t) => now - t < WINDOW_MS
  );

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
