import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: ["http://localhost:5000"],
    credentials: true,
  }),
);

let latestMessage = null;
let waitingClients = [];

app.get("/poll", (req, res) => {
  if (latestMessage) {
    return res.json({ message: latestMessage });
  }

  waitingClients.push(res);

  req.on("close", () => {
    waitingClients = waitingClients.filter((r) => r !== res);
  });
});

app.post("/update", express.json(), (req, res) => {
  latestMessage = req.body.message || "New update";

  waitingClients.forEach((r) => r.json({ message: latestMessage }));

  waitingClients = [];
  latestMessage = null;

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
