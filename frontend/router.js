import { DataFetcher } from "./router/dataFetcher.js";
import { SidebarManager } from "./router/sidebarManager.js";
import userManager from "./events/handlers/userManager.js";

class Router {
  constructor() {
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
      this.loadRoute(path);
    });

    // initial route
    const currentPath = window.location.pathname;
    const initialRoute = userManager.isAuthenticated()
      ? currentPath === "/" || currentPath === "/login" || currentPath === "/signup"
        ? "/home"
        : currentPath
      : "/login";
    
    if (currentPath !== initialRoute) {
      this.navigate(initialRoute);
    } else {
      this.loadRoute(initialRoute);
    }
  }

  setupDbWorkerListener() {
    if (!this.dbWorker) {
      console.warn("DB Worker not available");
      return;
    }

    this.dbWorker.addEventListener("message", (e) => {
      const currentPath = window.location.pathname;
      this.dataFetcher.handleDbWorkerMessage(e.data, currentPath);
    });
  }

  // Navigate to a new route
  navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    this.loadRoute(path);
  }

  // loads routes and scripts
  async loadRoute(path) {
    try {
      const user = userManager.getUser();
      const currentPath = window.location.pathname;
      
      // Clear stress test if leaving leads page
      if (currentPath === "/leads" && path !== "/leads") {
        const navbar = document.querySelector("app-navbar");
        if (navbar && navbar.clearStressTest) {
          navbar.clearStressTest();
        }
      }

      // Check authentication
      const publicRoutes = ["/login", "/signup"];
      if (!user && !publicRoutes.includes(path)) {
        // Navigate to backend-served login page
        window.location.href = "/login";
        return;
      }

      // If user is logged in and trying to access public routes, redirect to home
      if (user && publicRoutes.includes(path)) {
        window.location.href = "/home";
        return;
      }

      // Since backend serves pages, just navigate directly
      if (currentPath !== path) {
        window.location.href = path;
        return;
      }

      // Only update UI elements for current page
      this.sidebarManager.updateActive(path);

      if (user) {
        this.sidebarManager.isAdmin(user.role);
        
        // Update user profile in sidebar
        const { updateUserDetails } = await import("./events/userProfile.js");
        updateUserDetails();
      }

      if (window.TableFeatures) {
        window.TableFeatures.initialize(path);
      }
    } catch (error) {
      console.error("Error loading route:", error);
      this.handleRouteError(error);
    }
  }

  scheduleDataFetch(path) {
    // Disabled: Backend now serves data with pages
    // IndexedDB is only used for offline storage
    console.log("Data fetching disabled - backend serves data");
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
