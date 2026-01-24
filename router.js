// router.js - Main Router Module
import { RouteManager } from "./router/RouteManager.js";
import { PageLoader } from "./router/PageLoader.js";
import { DataFetcher } from "./router/DataFetcher.js";
import { SidebarManager } from "./router/SidebarManager.js";

class Router {
  constructor() {
    this.routeManager = new RouteManager();
    this.pageLoader = new PageLoader();
    this.dataFetcher = new DataFetcher();
    this.sidebarManager = new SidebarManager();
    this.dbWorker = null;
    this.isInitialized = false;
  }

  initialize(dbWorker) {
    if (this.isInitialized) return;

    this.dbWorker = dbWorker;
    this.dataFetcher.setDbWorker(dbWorker);
    this.isInitialized = true;

    // Setup DB worker listener
    this.setupDbWorkerListener();

    // Setup popstate handler
    window.addEventListener("popstate", () => {
      const path = window.location.pathname;
      if (this.routeManager.isValidRoute(path)) {
        this.loadRoute(path);
      }
    });

    // Load initial route
    const user = localStorage.getItem("user");
    const initialRoute = user ? "/home" : "/login";
    this.loadRoute(initialRoute);
  }

  setupDbWorkerListener() {
    if (!this.dbWorker) {
      console.warn("DB Worker not available");
      return;
    }

    this.dbWorker.addEventListener("message", (e) => {
      const { action, storeName, rows, data, error } = e.data;
      const currentPath = sessionStorage.getItem("currentTab");

      // Delegate to DataFetcher for handling
      this.dataFetcher.handleDbWorkerMessage(e.data, currentPath);
    });
  }

  async loadRoute(path) {
    try {
      const user = localStorage.getItem("user");
      const resolvedPath = this.routeManager.resolvePath(path, user);

      // Handle sidebar visibility
      this.sidebarManager.toggleSidebar(resolvedPath);

      // Load page content
      const html = await this.pageLoader.loadPage(resolvedPath);
      const mainPage = document.getElementById("main-page");

      if (mainPage) {
        mainPage.innerHTML = html;
      }

      // Load page-specific scripts
      await this.pageLoader.loadPageScript(path);

      // Fetch data after page is loaded - pass the ORIGINAL path, not resolved
      this.scheduleDataFetch(path);

      // Update active state - pass the ORIGINAL path
      this.sidebarManager.updateActiveState(path);

      // Initialize table features
      if (window.TableFeatures) {
        window.TableFeatures.initialize();
      }
    } catch (error) {
      console.error("Error loading route:", error);
      this.handleRouteError(error);
    }
  }

  scheduleDataFetch(path) {
    // Set currentTab AFTER everything is loaded
    setTimeout(() => {
      if (!this.dbWorker) {
        console.warn("Database worker not ready");
        return;
      }

      // Fetch data based on route - use original path like "/leads"
      this.dataFetcher.fetchDataForRoute(path);

      // Set currentTab to the ORIGINAL path ("/leads", not "/pages/leads.html")
      sessionStorage.setItem("currentTab", path);
    }, 100);
  }

  handleRouteError(error) {
    const mainPage = document.getElementById("main-page");
    if (mainPage) {
      mainPage.innerHTML = `
        <div class="p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h2 class="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Page</h2>
          <p class="text-red-600 dark:text-red-300">${error.message}</p>
          <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Reload Page
          </button>
        </div>
      `;
    }
  }
}

// Create and export singleton instance
const router = new Router();

// Export both the instance and the class
export { router as default, Router };

// Make available globally for compatibility
window.router = router;
