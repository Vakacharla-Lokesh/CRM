import { eventBus, EVENTS } from "./events/eventBus.js";
import { initializeEventHandlers } from "./events/eventHandler.js";
import WSClient from "./websockets/client.js";

// create DB worker and expose it globally
window.dbWorker = new Worker("workers/dbWorker.js", { type: "module" });
const dbWorker = window.dbWorker;

// forward important DB worker messages to EventBus
dbWorker.addEventListener("message", (e) => {
  const payload = e.data || {};

  if (payload.action === "dbReady") {
    eventBus.emit(EVENTS.DB_READY, payload);
  }

  if (payload.action === "insertSuccess") {
    eventBus.emit(EVENTS.LEAD_CREATED, payload);
  }

  if (payload.action === "deleteSuccess") {
    eventBus.emit(EVENTS.LEAD_DELETED, payload);
  }

  if (payload.action === "insertError" || payload.action === "dbError") {
    eventBus.emit(EVENTS.DB_ERROR, payload);
  }
});

// initialize event handlers (DOM + event bus)
initializeEventHandlers(dbWorker);

// WebSocket client
const ws = new WSClient("ws://localhost:8080");
window.ws = ws;

ws.onOpen = () => {
  const wssBtn = document.getElementById("data-WSS");
  if (wssBtn) wssBtn.classList.add("text-green-600");
};

ws.onMessage = (data) => {
  // route messages through the event bus
  eventBus.emit(EVENTS.WEB_SOCKET_MESSAGE, { message: data?.message ?? data });
};

ws.connect();
