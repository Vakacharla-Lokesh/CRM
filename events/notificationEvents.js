// Show notification in top right drop down
export function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg transition-all transform translate-x-0 z-50 ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// show message on top right that a new event occured
export function showMessage(event) {
  const payload = event?.detail || event;
  const message = payload?.message ?? payload;

  const messages = document.getElementById("messages");
  if (!messages) return;

  const msgElement = document.createElement("div");
  msgElement.className = "text-gray-700 dark:text-gray-300 mb-1";
  msgElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

  messages.appendChild(msgElement);
  messages.scrollTop = messages.scrollHeight;

  while (messages.children.length > 10) {
    messages.removeChild(messages.firstChild);
  }
}
