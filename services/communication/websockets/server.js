import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

console.log("WebSocket server running at ws://localhost:8080");

wss.on("connection", (ws) => {
  console.log("Client connected");``

  // ws.send(JSON.stringify({ type: "welcome", message: "Hello from server!" }));

  ws.on("message", (data, isBinary) => {
    console.log("Received from client:", data.toString());

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(data, {binary: isBinary});
      }
    });

    // ws.send(JSON.stringify({ type: "echo", data: data.toString() }));
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
