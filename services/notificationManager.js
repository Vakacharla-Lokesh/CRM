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
    const toast = document.createElement("div");

    const typeClasses = {
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      info: "bg-blue-500 text-white",
      warning: "bg-yellow-500 text-white",
    };

    toast.className = `fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg transition-all transform translate-x-0 z-50 ${typeClasses[type] || typeClasses.info}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Auto remove after timeout
    setTimeout(() => {
      toast.style.transform = "translateX(400px)";
      setTimeout(() => toast.remove(), 300);
    }, this.toastTimeout);
  }

  /**
   * Show both toast and add to dropdown
   */
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

  /**
   * Show notification badge
   */
  showBadge() {
    const badge = document.getElementById("notification-badge");
    if (badge) {
      badge.classList.remove("hidden");
    }
  }

  /**
   * Hide notification badge
   */
  hideBadge() {
    const badge = document.getElementById("notification-badge");
    if (badge) {
      badge.classList.add("hidden");
    }
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.length = 0;
    this.updateDropdownUI();
    this.hideBadge();
  }

  /**
   * Get all notifications
   */
  getAll() {
    return [...this.notifications];
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Initialize dropdown event listeners
   */
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

// Create singleton instance
export const notificationManager = new NotificationManager();

// Export convenience functions for backward compatibility
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
