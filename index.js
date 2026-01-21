import { eventBus, EVENTS } from "./events/eventBus.js";
import { initializeEventHandlers } from "./events/eventHandler.js";
import { addTestUsers } from "./services/addTestUsers.js";
import WSClient from "./websockets/client.js";

window.dbWorker = new Worker("workers/dbWorker.js", { type: "module" });
const dbWorker = window.dbWorker;

const notifications = [];
const MAX_NOTIFICATIONS = 10;

function addNotification(message, type = "info") {
  const notification = {
    id: Date.now(),
    message,
    type,
    timestamp: new Date().toLocaleTimeString(),
  };

  notifications.unshift(notification);
  if (notifications.length > MAX_NOTIFICATIONS) {
    notifications.pop();
  }

  updateNotificationUI();
  showNotificationBadge();
}

function updateNotificationUI() {
  const notificationList = document.getElementById("notification-list");
  if (!notificationList) return;

  if (notifications.length === 0) {
    notificationList.innerHTML = `
      <div class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        No notifications yet
      </div>
    `;
    return;
  }

  notificationList.innerHTML = notifications
    .map(
      (notif) => `
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div class="flex items-start gap-2">
        <div class="w-2 h-2 mt-1.5 rounded-full ${
          notif.type === "success"
            ? "bg-green-500"
            : notif.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
        }"></div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900 dark:text-gray-100 break-words">${notif.message}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${notif.timestamp}</p>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

function showNotificationBadge() {
  const badge = document.getElementById("notification-badge");
  if (badge) {
    badge.classList.remove("hidden");
  }
}

function hideNotificationBadge() {
  const badge = document.getElementById("notification-badge");
  if (badge) {
    badge.classList.add("hidden");
  }
}

// Notification dropdown toggle
document.addEventListener("click", (e) => {
  const notificationBtn = document.getElementById("notification-btn");
  const notificationDropdown = document.getElementById("notification-dropdown");

  if (e.target.closest("#notification-btn")) {
    e.stopPropagation();
    notificationDropdown.classList.toggle("hidden");
    hideNotificationBadge();
  } else if (!e.target.closest("#notification-dropdown")) {
    notificationDropdown.classList.add("hidden");
  }

  if (e.target.closest("#clear-notifications")) {
    notifications.length = 0;
    updateNotificationUI();
    hideNotificationBadge();
  }
});

dbWorker.addEventListener("message", (e) => {
  const payload = e.data || {};

  if (payload.action === "dbReady") {
    eventBus.emit(EVENTS.DB_READY, payload);
    addNotification("Database initialized successfully", "success");
  }

  if (payload.action === "insertSuccess") {
    if (payload.storeName === "Leads") {
      eventBus.emit(EVENTS.LEAD_CREATED, payload);
      addNotification("Lead created successfully", "success");
    } else if (payload.storeName === "Organizations") {
      eventBus.emit(EVENTS.ORGANIZATION_CREATED, payload);
      addNotification("Organization created successfully", "success");
    }
  }

  if (payload.action === "deleteSuccess") {
    switch (payload.storeName) {
      case "Leads":
        eventBus.emit(EVENTS.LEAD_DELETED, payload);
        break;
      case "Organizations":
        eventBus.emit(EVENTS.ORGANIZATION_DELETED, payload);
        break;
    }
    addNotification(`${payload.storeName} deleted successfully`, "success");
  }

  if (payload.action === "insertError" || payload.action === "dbError") {
    eventBus.emit(EVENTS.DB_ERROR, payload);
    addNotification(`Error: ${payload.error}`, "error");
  }
});

initializeEventHandlers(dbWorker);

eventBus.on(EVENTS.USER_CREATED, (event) => {
  const userData = event.detail;
  addNotification(
    `New user created: ${userData.name} (${userData.email})`,
    "success",
  );

  if (window.ws) {
    window.ws.send({
      type: "user_created",
      data: userData,
      timestamp: new Date().toISOString(),
    });
  }
});
eventBus.on(EVENTS.LOGIN_SUCCESS, (event) => {
  const userData = event.detail;
  addNotification(`Welcome back, ${userData.name}!`, "success");
});

const ws = new WSClient("ws://localhost:8080");
window.ws = ws;

ws.onOpen = () => {
  const wssStatus = document.getElementById("status-wss");
  if (wssStatus) {
    wssStatus.querySelector("span:first-child").classList.remove("bg-gray-400");
    wssStatus.querySelector("span:first-child").classList.add("bg-green-500");
  }
  addNotification("WebSocket connected", "success");
};

ws.onClose = () => {
  const wssStatus = document.getElementById("status-wss");
  if (wssStatus) {
    wssStatus
      .querySelector("span:first-child")
      .classList.remove("bg-green-500");
    wssStatus.querySelector("span:first-child").classList.add("bg-red-500");
  }
  addNotification("WebSocket disconnected", "error");
};

ws.onMessage = (data) => {
  eventBus.emit(EVENTS.WEB_SOCKET_MESSAGE, { message: data?.message ?? data });

  const messageText = typeof data === "object" ? JSON.stringify(data) : data;
  addNotification(`WS: ${messageText}`, "info");

  const messages = document.getElementById("messages");
  if (messages) {
    const msgLine = document.createElement("div");
    msgLine.className = "text-gray-700 dark:text-gray-300 mb-1";
    msgLine.textContent = `[${new Date().toLocaleTimeString()}] ${messageText}`;
    messages.appendChild(msgLine);
    messages.scrollTop = messages.scrollHeight;
  }
};

ws.connect();

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");

    if (isDark) {
      html.classList.remove("dark");
      themeToggle.textContent = "🌙";
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      themeToggle.textContent = "☀️";
      localStorage.setItem("theme", "dark");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (prefersDark ? "dark" : "light");

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    if (themeToggle) themeToggle.textContent = "🌙";
  }
});

const leadsBody = document.querySelector("#leads-body");
const selectAllCheckbox = document.getElementById("select-all-leads");

if (leadsBody) {
  leadsBody.addEventListener("change", function (event) {
    if (event.target.classList.contains("item-checkbox")) {
      const allCheckboxes = document.querySelectorAll(".item-checkbox");
      const allChecked = Array.from(allCheckboxes).every((cb) => cb.checked);
      selectAllCheckbox.checked = allChecked;
    }
  });
}

if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener("change", function () {
    const checkboxes = document.querySelectorAll(".item-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = this.checked;
    });
  });
}
