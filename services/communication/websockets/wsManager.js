import { eventBus, EVENTS } from "../../../events/eventBus.js";
import { addNotification } from "../../../index.js";
import WSClient from "./client.js";

export function initWebSocket({
  url,
  statusElementId = "status-wss",
  reconnectDelay = 5000,
}) {
  const ws = new WSClient(url);
  let reconnectTimeout = null;

  function setStatus(color) {
    const el = document.getElementById(statusElementId);
    if (!el) return;

    const dot = el.querySelector("span:first-child");
    dot.classList.remove("bg-gray-400", "bg-green-500", "bg-red-500");
    dot.classList.add(color);
  }

  function scheduleReconnect() {
    if (reconnectTimeout) return;

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      ws.connect();
    }, reconnectDelay);
  }

  ws.onOpen = () => {
    setStatus("bg-green-500");
    addNotification("WebSocket connected", "success");
  };

  ws.onClose = () => {
    setStatus("bg-red-500");
    addNotification("WebSocket disconnected", "error");
    scheduleReconnect();
  };

  ws.onError = () => {
    setStatus("bg-red-500");
    scheduleReconnect();
  };

  ws.onMessage = (data) => {
    eventBus.emit(EVENTS.WEB_SOCKET_MESSAGE, {
      message: data?.message ?? data,
    });

    const text = typeof data === "object" ? JSON.stringify(data) : data;
    addNotification(`WS: ${text}`, "info");
  };

  ws.connect();

  return {
    send(message) {
      ws.send(message);
    },
    disconnect() {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      ws.close();
    },
    getClient() {
      return ws;
    },
  };
}
