class NotificationManager {
  constructor() {
    this.notifications = [];
    this.MAX_NOTIFICATIONS = 10;
    this.toastTimeout = 3000;
  }

  addToDropdown(message, type = "info") {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };

    this.notifications.unshift(notification);

    // Keep only MAX_NOTIFICATIONS
    if (this.notifications.length > this.MAX_NOTIFICATIONS) {
      this.notifications.pop();
    }

    this.updateDropdownUI();
    this.showBadge();
  }

  /**
   * Show toast notification (temporary popup)
   */
  showToast(message, type = "info") {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement("div");
      this.toastContainer.id = "toast-container";
      this.toastContainer.className =
        "fixed top-20 right-80 z-[9999] flex flex-col gap-2";
      document.body.appendChild(this.toastContainer);
    }

    const colorSchemes = {
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      warning: "bg-yellow-500 text-white",
      info: "bg-blue-500 text-white",
    };

    const icons = {
      success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
    </svg>`,
      error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>`,
      warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
    </svg>`,
      info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`,
    };

    const toast = document.createElement("div");
    toast.className = `
    ${colorSchemes[type] || colorSchemes.info}
    w-80 px-4 py-4 rounded-lg shadow-lg
    flex items-center gap-3
    transform translate-x-full
    transition-transform duration-300 ease-out
  `;

    toast.innerHTML = `
    <div class="flex-shrink-0">
      ${icons[type] || icons.info}
    </div>
    <div class="flex-1 text-sm font-medium">
      ${this.escapeHtml(message)}
    </div>
    <button
      class="flex-shrink-0 hover:opacity-75 transition-opacity"
      aria-label="Close"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  `;

    toast.querySelector("button").onclick = () => toast.remove();

    this.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = "translateX(0)";
    });

    setTimeout(() => {
      toast.style.transform = "translateX(120%)";
      setTimeout(() => toast.remove(), 300);
    }, this.toastTimeout);
  }

  notify(message, type = "info", options = {}) {
    const { showToast = true, showInDropdown = true } = options;

    if (showToast) {
      this.showToast(message, type);
    }

    if (showInDropdown) {
      this.addToDropdown(message, type);
    }
  }

  /**
   * Update the dropdown UI
   */
  updateDropdownUI() {
    const notificationList = document.getElementById("notification-list");
    if (!notificationList) return;

    if (this.notifications.length === 0) {
      notificationList.innerHTML = `
        <div class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          No notifications yet
        </div>
      `;
      return;
    }

    notificationList.innerHTML = this.notifications
      .map(
        (notif) => `
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <div class="flex items-start gap-2">
          <div class="w-2 h-2 mt-1.5 rounded-full ${this.getTypeColor(notif.type)}"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-900 dark:text-gray-100 break-words">${this.escapeHtml(notif.message)}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${notif.timestamp}</p>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  }

  /**
   * Get color class for notification type
   */
  getTypeColor(type) {
    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      info: "bg-blue-500",
      warning: "bg-yellow-500",
    };
    return colors[type] || colors.info;
  }

  showBadge() {
    const badge = document.getElementById("notification-badge");
    if (badge) {
      badge.classList.remove("hidden");
    }
  }

  hideBadge() {
    const badge = document.getElementById("notification-badge");
    if (badge) {
      badge.classList.add("hidden");
    }
  }

  clearAll() {
    this.notifications.length = 0;
    this.updateDropdownUI();
    this.hideBadge();
  }

  getAll() {
    return [...this.notifications];
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  initializeDropdown() {
    document.addEventListener("click", (e) => {
      const notificationDropdown = document.getElementById(
        "notification-dropdown",
      );

      if (!notificationDropdown) return;

      if (e.target.closest("#notification-btn")) {
        e.stopPropagation();
        notificationDropdown.classList.toggle("hidden");
        this.hideBadge();
      } else if (!e.target.closest("#notification-dropdown")) {
        notificationDropdown.classList.add("hidden");
      }

      if (e.target.closest("#clear-notifications")) {
        this.clearAll();
      }
    });
  }
}

export const notificationManager = new NotificationManager();

export function showNotification(message, type = "info") {
  notificationManager.showToast(message, type);
}

export function addNotification(message, type = "info") {
  notificationManager.notify(message, type);
}

export function showMessage(event) {
  const payload = event?.detail || event;
  const message = payload?.message ?? payload;
  notificationManager.addToDropdown(message, "info");
}
