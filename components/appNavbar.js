import { populateLeadsTable } from "../controllers/populateLeads.js";
import { eventBus, EVENTS } from "../events/eventBus.js";
import { generateRandomLeads } from "../services/utils/randomLeadGenerator.js";
import { offlineManager } from "../services/offlineManager.js";
import { notificationController } from "../controllers/notificationController.js";

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
              src="../public/crm.png"
              alt="Logo"
              class="h-7"
            />
            <span class="text-lg font-semibold">Campaign Flux</span>
          </a>

          <div class="flex items-center gap-3">
            <button
              type="button"
              id="sync-btn"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg shadow transition-colors"
            >
              <span
                id="sync-status-dot"
                class="w-2.5 h-2.5 rounded-full bg-green-400"
              ></span>
              <span id="sync-status-text">Online</span>
              <span id="offline-count" class="hidden ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                0
              </span>
            </button>
            <button
              type="button"
              id="stress-test-btn"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors"
            >
              Stress Test
            </button>
            <button
              type="button"
              id="diagnostic-btn"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors"
            >
              Test Diagnostic
            </button>
            <div class="flex items-center gap-2">
              <div
                id="status-short-polling"
                class="flex items-center gap-1 px-2 py-1 rounded text-xs"
              >
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>SPS</span>
              </div>
              <div
                id="status-long-polling"
                class="flex items-center gap-1 px-2 py-1 rounded text-xs"
              >
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>LPS</span>
              </div>
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
          </div>
        </div>
      </nav>
`;

class AppNavbar extends HTMLElement {
  constructor() {
    super();
    this.isStressTestActive = false;
    this.isSync = true;

    window.isSync = this.isSync;
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }
    this.setupEventListeners();

    if (this.isSync) {
      this.syncLeads();
    }
    
    // Update offline count initially and every 5 seconds
    this.updateOfflineCount();
    this.offlineCountInterval = setInterval(() => this.updateOfflineCount(), 5000);
  }

  setupEventListeners() {
    this.diagnosticBtn = document.querySelector("#diagnostic-btn");
    if (this.diagnosticBtn) {
      this.diagnosticBtn.addEventListener(
        "click",
        this.runTaskDiagnostics.bind(this),
      );
    }

    this.stressTestBtn = document.querySelector("#stress-test-btn");
    if (this.stressTestBtn) {
      this.stressTestBtn.addEventListener(
        "click",
        this.toggleStressTest.bind(this),
      );
    }

    this.syncBtn = document.querySelector("#sync-btn");
    this.syncText = document.querySelector("#sync-status-text");
    this.syncDot = document.querySelector("#sync-status-dot");

    if (this.syncBtn) {
      this.syncBtn.addEventListener("click", () => {
        if (this.isSync === true) {
          this.syncText.textContent = "Offline";
          this.isSync = false;
          window.isSync = false;

          this.syncBtn.classList.remove(
            "bg-green-600",
            "hover:bg-green-700",
            "dark:bg-green-500",
            "dark:hover:bg-green-600",
          );
          this.syncBtn.classList.add(
            "bg-red-600",
            "hover:bg-red-700",
            "dark:bg-red-500",
            "dark:hover:bg-red-600",
          );

          this.syncDot.classList.remove("bg-green-400");
          this.syncDot.classList.add("bg-red-400");
        } else {
          this.syncText.textContent = "Online";
          this.isSync = true;
          window.isSync = true;

          this.syncBtn.classList.remove(
            "bg-red-600",
            "hover:bg-red-700",
            "dark:bg-red-500",
            "dark:hover:bg-red-600",
          );
          this.syncBtn.classList.add(
            "bg-green-600",
            "hover:bg-green-700",
            "dark:bg-green-500",
            "dark:hover:bg-green-600",
          );

          this.syncDot.classList.remove("bg-red-400");
          this.syncDot.classList.add("bg-green-400");

          // Trigger offline sync
          this.syncOfflineData();
        }
      });
    }
  }

  handleDbCreate() {
    if (window.dbWorker) {
      window.dbWorker.postMessage({ action: "initialize" });
    }
  }

  toggleStressTest() {
    if (this.isStressTestActive) {
      this.clearStressTest();
    } else {
      this.runStressTest();
    }
  }

  runTaskDiagnostics() {
    console.log("0 Synchronous: start");

    // Microtask
    Promise.resolve().then(() => {
      console.log("3 Microtask: Promise.then");
    });

    // Macrotask
    setTimeout(() => {
      console.log("4 Macrotask: setTimeout");
    }, 0);

    // Microtask
    queueMicrotask(() => {
      console.log("2 Microtask: queueMicrotask");
    });

    console.log("1 Synchronous: end");
  }

  async runStressTest() {
    console.log("Starting stress test mode...");
    const tempLeads = await generateRandomLeads(1000);

    console.log(`Generated ${tempLeads.length} temporary leads`);
    console.log("Populating table with stress test data...");
    populateLeadsTable(tempLeads);

    console.timeEnd("Stress Test Execution");

    window.stressTestLeads = tempLeads;
    window.stressTestActive = true;
    this.isStressTestActive = true;

    // Update button text
    if (this.stressTestBtn) {
      this.stressTestBtn.textContent = "Clear Stress Test";
      this.stressTestBtn.classList.remove(
        "bg-blue-600",
        "hover:bg-blue-700",
        "dark:bg-blue-500",
        "dark:hover:bg-blue-600",
      );
      this.stressTestBtn.classList.add(
        "bg-red-600",
        "hover:bg-red-700",
        "dark:bg-red-500",
        "dark:hover:bg-red-600",
      );
    }
  }

  clearStressTest() {
    if (window.stressTestActive || this.isStressTestActive) {
      console.log("Clearing stress test");
      if (window.stressTestLeads) {
        window.stressTestLeads.length = 0;
        window.stressTestLeads = null;
      }

      window.stressTestActive = false;
      this.isStressTestActive = false;
      if (this.stressTestBtn) {
        this.stressTestBtn.textContent = "Stress Test";
        this.stressTestBtn.classList.remove(
          "bg-red-600",
          "hover:bg-red-700",
          "dark:bg-red-500",
          "dark:hover:bg-red-600",
        );
        this.stressTestBtn.classList.add(
          "bg-blue-600",
          "hover:bg-blue-700",
          "dark:bg-blue-500",
          "dark:hover:bg-blue-600",
        );
      }

      const currentPath = sessionStorage.getItem("currentTab");
      if (currentPath === "/leads") {
        console.log("Before event leads refresh emit: ");
        eventBus.emit(EVENTS.LEADS_REFRESH);
        console.log("After event leads refresh emit: ");
      }

      console.log("Stress test cleared - memory should be freed");
    }
  }

  syncLeads() {
    // Legacy support - check sessionStorage
    if (window.dbWorker) {
      let localLeads = JSON.parse(sessionStorage.getItem("leads"));

      if (localLeads && localLeads.length > 0) {
        console.log("local leads: ", localLeads);

        localLeads.forEach((lead) => {
          eventBus.emit(EVENTS.LEAD_CREATE, { leadData: lead });
        });

        sessionStorage.removeItem("leads");
      }
    }
  }

  async syncOfflineData() {
    const totalCount = offlineManager.getTotalOfflineCount();
    
    if (totalCount === 0) {
      notificationController.showToast('No offline data to sync', 'info');
      return;
    }
    
    notificationController.showToast(`Syncing ${totalCount} offline items...`, 'info');
    
    try {
      // Sync all offline data via event bus
      offlineManager.syncAll(eventBus, EVENTS);
      
      // Wait for sync to complete
      setTimeout(() => {
        notificationController.showToast('Sync completed successfully!', 'success');
        
        // Update offline count
        this.updateOfflineCount();
        
        // Refresh current page data
        const currentTab = sessionStorage.getItem('currentTab');
        if (currentTab === '/leads') {
          eventBus.emit(EVENTS.LEADS_REFRESH);
        } else if (currentTab === '/organizations') {
          // Trigger organization refresh if available
          if (window.dbWorker) {
            window.dbWorker.postMessage({ action: 'getAllOrganizations' });
          }
        } else if (currentTab === '/deals') {
          // Trigger deals refresh if available
          if (window.dbWorker) {
            window.dbWorker.postMessage({ action: 'getAllDeals' });
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('Sync failed:', error);
      notificationController.showToast('Sync failed. Please try again.', 'error');
    }
  }

  updateOfflineCount() {
    const count = offlineManager.getTotalOfflineCount();
    const badge = document.querySelector('#offline-count');
    
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  disconnectedCallback() {
    // Clean up interval when component is removed
    if (this.offlineCountInterval) {
      clearInterval(this.offlineCountInterval);
    }
  }
}

customElements.define("app-navbar", AppNavbar);
