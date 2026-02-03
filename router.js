import { RouteManager } from "./router/routeManager.js";
import { PageLoader } from "./router/pageLoader.js";
import { DataFetcher } from "./router/dataFetcher.js";
import { SidebarManager } from "./router/sidebarManager.js";
import userManager from "./events/handlers/userManager.js";

class Router {
  constructor() {
    this.routeManager = new RouteManager();
    this.pageLoader = new PageLoader();
    this.dataFetcher = new DataFetcher();
    this.sidebarManager = new SidebarManager();
    this.dbWorker = null;
    this.isInitialized = false;
  }

  // initializes router
  initialize(dbWorker) {
    if (this.isInitialized) return;

    this.dbWorker = dbWorker;
    this.dataFetcher.setDbWorker(dbWorker);
    this.isInitialized = true;

    // DB worker
    this.setupDbWorkerListener();

    window.addEventListener("popstate", () => {
      const path = window.location.pathname;
      if (this.routeManager.isValidRoute(path)) {
        this.loadRoute(path);
      }
    });

    // initial route
    const initialRoute = userManager.isAuthenticated() ? "/home" : "/login";
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
      this.dataFetcher.handleDbWorkerMessage(e.data, currentPath);
    });
  }

  // loads routes and scripts
  async loadRoute(path) {
    try {
      const user = userManager.getUser();
      const currentPath = sessionStorage.getItem("currentTab");
      if (currentPath === "/leads" && path !== "/leads") {
        const navbar = document.querySelector("app-navbar");
        if (navbar && navbar.clearStressTest) {
          navbar.clearStressTest();
        }
      }
      const resolvedPath = this.routeManager.resolvePath(path, user);
      
      this.sidebarManager.toggleSidebar(resolvedPath);

      const html = await this.pageLoader.loadPage(resolvedPath);
      const mainPage = document.getElementById("main-page");

      if (mainPage) {
        mainPage.innerHTML = html;
      }

      await this.pageLoader.loadPageScript(path);

      this.scheduleDataFetch(path);

      this.sidebarManager.updateActive(path);

      if (user) {
        this.sidebarManager.isAdmin(user.role);
      }
    } catch (error) {
      console.error("Error loading route:", error);
      this.handleRouteError(error);
    }
  }

  scheduleDataFetch(path) {
    sessionStorage.setItem("currentTab", path);

    setTimeout(() => {
      if (!this.dbWorker) {
        console.warn("Database worker not ready");
        return;
      }

      this.dataFetcher.fetchDataForRoute(path);
    }, 100);
    if (window.TableFeatures) {
      window.TableFeatures.initialize(path);
    }
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

const router = new Router();

export { router as default, Router };
window.router = router;
