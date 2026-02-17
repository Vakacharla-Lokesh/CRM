import { DataFetcher } from "./router/dataFetcher.js";
import { SidebarManager } from "./router/sidebarManager.js";
import userManager from "./events/handlers/userManager.js";
import { updateUserDetails } from "./events/userProfile.js";

class Router {
  constructor() {
    if (!window.isSync) {
      this.dataFetcher = new DataFetcher();
    }
    this.sidebarManager = new SidebarManager();
    this.dbWorker = null;
    this.isInitialized = false;
  }

  // initializes router
  initialize(dbWorker) {
    if (this.isInitialized) return;

    this.dbWorker = dbWorker;
    if (!window.isSync) {
      this.dataFetcher.setDbWorker(dbWorker);
    }
    this.isInitialized = true;

    // DB worker
    this.setupDbWorkerListener();

    window.addEventListener("popstate", () => {
      const path = window.location.pathname;
      this.loadRoute(path);
    });

    // Just update UI for current page - backend handles auth redirects
    const currentPath = window.location.pathname;
    this.loadRoute(currentPath);
  }

  setupDbWorkerListener() {
    if (!this.dbWorker) {
      console.warn("DB Worker not available");
      return;
    }

    this.dbWorker.addEventListener("message", (e) => {
      const currentPath = window.location.pathname;
      if (!window.isSync) {
        this.dataFetcher.handleDbWorkerMessage(e.data, currentPath);
      }
    });
  }

  // Navigate to a new route
  navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
      this.loadRoute(path);
    }
  }

  // loads routes and scripts
  async loadRoute(path) {
    try {
      const user = userManager.getUser();
      
      // Import RouteManager
      const { RouteManager } = await import("./router/routeManager.js");
      const routeManager = new RouteManager();

      // Check if route requires authentication
      if (routeManager.isAuthRequired(path) && !user) {
        window.history.replaceState(null, "", "/login");
        return this.loadRoute("/login");
      }

      // Redirect authenticated users away from public routes
      if (user && routeManager.isPublicRoute(path)) {
        window.history.replaceState(null, "", "/home");
        return this.loadRoute("/home");
      }

      if (
        window.location.pathname !== path &&
        window.location.pathname === "/leads"
      ) {
        const navbar = document.querySelector("app-navbar");
        if (navbar && navbar.clearStressTest) {
          navbar.clearStressTest();
        }
      }

      // Get the page HTML path
      const pagePath = routeManager.getRoutePath(path);
      
      // Fetch and inject page content
      const mainPage = document.getElementById("main-page");
      if (mainPage) {
        const response = await fetch(pagePath);
        if (!response.ok) {
          throw new Error(`Failed to load page: ${response.status}`);
        }
        const html = await response.text();
        mainPage.innerHTML = html;
      }

      // Load route-specific script if exists
      const scriptPath = routeManager.getRouteScript(path);
      if (scriptPath) {
        const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
        if (!existingScript) {
          const script = document.createElement("script");
          script.type = "module";
          script.src = scriptPath;
          document.body.appendChild(script);
        }
      }

      this.sidebarManager.updateActive(path);

      if (user) {
        this.sidebarManager.isAdmin(user.role);

        // Update user profile in sidebar
        updateUserDetails();

        // Sync data from backend on home page load
        if (path === "/home") {
          const { syncAllDataOnLogin } =
            await import("./services/data/initialDataSync.js");
          syncAllDataOnLogin(user);
        }
      }

      if (window.TableFeatures) {
        window.TableFeatures.initialize(path);
      }

      // Schedule data fetch for the current route
      this.scheduleDataFetch(path);
    } catch (error) {
      console.error("Error loading route:", error);
      this.handleRouteError(error);
    }
  }

  scheduleDataFetch(path) {
    if (!window.isSync) {
      this.dataFetcher.scheduleDataFetch(path);
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
