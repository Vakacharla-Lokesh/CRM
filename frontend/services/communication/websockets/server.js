import { WebSocketServer } from "ws";

const tenants = new Map();

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  console.log("WebSocket attached to HTTP server");

  wss.on("connection", (ws, req) => {
    const params = new URLSearchParams(req.url.replace("/?", ""));
    const tenantId = params.get("tenant_id");

    if (!tenantId) {
      ws.close(1008, "tenant_id required");
      return;
    }

    ws.tenantId = tenantId;

    if (!tenants.has(tenantId)) {
      tenants.set(tenantId, new Set());
    }

    tenants.get(tenantId).add(ws);

    console.log(`Client connected | tenant=${tenantId}`);

    ws.on("message", (data, isBinary) => {
      const tenantGroup = tenants.get(ws.tenantId);
      if (tenantGroup) {
        tenantGroup.forEach((client) => {
          if (client.readyState === 1) {
            client.send(data, { binary: isBinary });
          }
        });
      }

      const globalGroup = tenants.get("__GLOBAL__");
      if (globalGroup) {
        globalGroup.forEach((adminWs) => {
          if (adminWs.readyState === 1) {
            adminWs.send(data, { binary: isBinary });
          }
        });
      }
    });

    ws.on("close", () => {
      tenants.get(ws.tenantId)?.delete(ws);
      if (tenants.get(ws.tenantId)?.size === 0) {
        tenants.delete(ws.tenantId);
      }
      console.log(`Client disconnected | tenant=${ws.tenantId}`);
    });
  });
}
