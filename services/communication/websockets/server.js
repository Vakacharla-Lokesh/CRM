import { WebSocketServer } from "ws";

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  console.log("WebSocket attached to HTTP server");

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (data, isBinary) => {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(data, { binary: isBinary });
        }
      });
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
}
