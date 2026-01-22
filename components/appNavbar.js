import { eventBus, EVENTS } from "../events/eventBus.js";

const template = document.createElement("template");
template.innerHTML = `
  <nav
        class="fixed top-0 left-0 z-50 h-16 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <div
          class="mx-auto max-w-7xl flex items-center justify-between px-4 h-full"
        >
          <a
            href="/"
            class="flex items-center gap-2"
          >
            <img
              src="../crm.png"
              alt="Logo"
              class="h-7"
            />
            <span class="text-lg font-semibold">Campaign Flux</span>
          </a>

          <div class="flex items-center gap-3">
            <!-- Connection Status Indicators -->
            <div class="flex items-center gap-2">
              <div
                id="status-wss"
                class="flex items-center gap-1 px-2 py-1 rounded text-xs"
              >
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>WSS</span>
              </div>
              <div
                id="status-sse"
                class="flex items-center gap-1 px-2 py-1 rounded text-xs"
              >
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>SSE</span>
              </div>
            </div>

            <!-- Notification Dropdown -->
            <div class="relative">
              <button
                id="notification-btn"
                type="button"
                class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span
                  id="notification-badge"
                  class="hidden absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                ></span>
              </button>

              <!-- Dropdown Menu -->
              <div
                id="notification-dropdown"
                class="hidden absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden"
              >
                <div
                  class="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
                >
                  <h3 class="font-semibold">Notifications</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    WebSocket Updates
                  </p>
                </div>
                <div
                  id="notification-list"
                  class="overflow-y-auto max-h-80"
                >
                  <div
                    class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    No notifications yet
                  </div>
                </div>
                <div
                  class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"
                >
                  <button
                    id="clear-notifications"
                    class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
            <button
              id="theme-toggle"
              title="Toggle theme"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              🌙
            </button>
          </div>
        </div>
      </nav>
`;

class AppNavbar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }
    this.setupEventListeners();
    this.initializeTheme();
  }

  setupEventListeners() {
    this.themeToggle = document.getElementById("theme-toggle");
    if (this.themeToggle) {
      this.themeToggle.addEventListener(
        "click",
        this.handleThemeToggle.bind(this),
      );
    }

    this.dbStatusBtn = document.getElementById("data-createDb");
    if (this.dbStatusBtn) {
      this.dbStatusBtn.addEventListener(
        "click",
        this.handleDbCreate.bind(this),
      );
    }

    // eventBus.on(EVENTS.DB_READY, this.handleDbReady.bind(this));
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    this.currentTheme = savedTheme || (prefersDark ? "dark" : "light");
    this.applyTheme(this.currentTheme);
  }

  handleThemeToggle() {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(this.currentTheme);
    eventBus.emit(EVENTS.THEME_TOGGLE, { theme: this.currentTheme });
  }

  applyTheme(theme) {
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.textContent = theme === "dark" ? "☀️" : "🌙";
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }

  handleDbCreate() {
    if (window.dbWorker) {
      window.dbWorker.postMessage({ action: "initialize" });
    }
  }

  // handleDbReady() {
  //   const btn = document.getElementById("data-createDb");
  //   if (btn) {
  //     btn.textContent = "DB Ready";
  //     btn.classList.add("db-ready");
  //     btn.disabled = true;
  //   }
  // }
}

customElements.define("app-navbar", AppNavbar);
