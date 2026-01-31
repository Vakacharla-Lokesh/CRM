import { addNotification } from "../../../index.js";
import WSClient from "./client.js";

export function initWebSocket({
  url,
  statusElementId = "status-wss",
  pollInterval = 5000,
}) {
  const ws = new WSClient(url);
  window.ws = ws;

  let pollingInterval = null;

  function startShortPolling() {
    if (pollingInterval) return;

    pollingInterval = setInterval(() => {
      try {
        ws.connect();
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, pollInterval);
  }

  function stopShortPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  function setStatus(color) {
    const el = document.getElementById(statusElementId);
    if (!el) return;

    const dot = el.querySelector("span:first-child");
    dot.classList.remove("bg-gray-400", "bg-green-500", "bg-red-500");
    dot.classList.add(color);
  }

  ws.onOpen = () => {
    stopShortPolling();
    setStatus("bg-green-500");
    addNotification("WebSocket connected", "success");
  };

  ws.onClose = () => {
    startShortPolling();
    setStatus("bg-red-500");
    addNotification("WebSocket disconnected", "error");
  };

  ws.onMessage = (data) => {
    eventBus.emit(EVENTS.WEB_SOCKET_MESSAGE, {
      message: data?.message ?? data,
    });

    const messageText = typeof data === "object" ? JSON.stringify(data) : data;

    addNotification(`WS: ${messageText}`, "info");
  };
  ws.connect();
  return {
    disconnect() {
      stopShortPolling();
      ws.close?.();
    },
    getClient() {
      return ws;
    },
  };
}
