import { DataFetcher } from "./router/dataFetcher.js";
import { SidebarManager } from "./router/sidebarManager.js";
import userManager from "./events/handlers/userManager.js";

class Router {
  constructor() {
    this.dataFetcher = new DataFetcher();
    this.sidebarManager = new SidebarManager();
    this.dbWorker = null;
    this.isInitialized = false;
    
    // Route scripts mapping
    this.routeScripts = {
      "/login": "/js/login.js",
      "/signup": "/js/signup.js",
      "/deals": "/js/deals.js",
    };
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
        this.navigate("/login");
        return;
      }

      // If user is logged in and trying to access public routes, redirect to home
      if (user && publicRoutes.includes(path)) {
        this.navigate("/home");
        return;
      }

      this.sidebarManager.toggleSidebar(path);

      // Map routes to their HTML page files
      const pageMap = {
        "/home": "/pages/home.html",
        "/leads": "/pages/leads.html",
        "/organizations": "/pages/organizations.html",
        "/deals": "/pages/deals.html",
        "/leadDetails": "/pages/leadDetailPage.html",
        "/login": "/pages/login.html",
        "/signup": "/pages/signup.html",
        "/users": "/pages/users.html",
        "/tenants": "/pages/tenants.html",
      };

      const pagePath = pageMap[path] || pageMap["/home"];

      const response = await fetch(pagePath);
      if (!response.ok) {
        throw new Error(`Failed to load page: ${response.statusText}`);
      }
      
      const html = await response.text();
      const mainPage = document.getElementById("main-page");

      if (mainPage) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const mainContent = doc.querySelector("#main-page");
        
        if (mainContent) {
          mainPage.innerHTML = mainContent.innerHTML;
        } else {
          const bodyContent = doc.querySelector("body");
          if (bodyContent) {
            mainPage.innerHTML = bodyContent.innerHTML;
          } else {
            mainPage.innerHTML = html;
          }
        }
      }

      await this.loadPageScript(path);

      this.scheduleDataFetch(path);

      this.sidebarManager.updateActive(path);

      if (user) {
        this.sidebarManager.isAdmin(user.role);
      }

      if (window.TableFeatures) {
        window.TableFeatures.initialize(path);
      }
    } catch (error) {
      console.error("Error loading route:", error);
      this.handleRouteError(error);
    }
  }

  async loadPageScript(path) {
    const scriptPath = this.routeScripts[path];
    
    if (scriptPath) {
      try {
        // Remove existing script if present
        const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
        if (existingScript) {
          existingScript.remove();
        }

        // Load new script
        const script = document.createElement("script");
        script.type = "module";
        script.src = scriptPath;
        document.body.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      } catch (error) {
        console.error(`Failed to load script for ${path}:`, error);
      }
    }
  }

  scheduleDataFetch(path) {
    // Skip data fetching for public routes
    const publicRoutes = ["/login", "/signup"];
    if (publicRoutes.includes(path)) {
      return;
    }

    setTimeout(() => {
      if (!this.dbWorker) {
        console.warn("Database worker not ready");
        return;
      }

      this.dataFetcher.fetchDataForRoute(path);
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

const router = new Router();

export { router as default, Router };
window.router = router;
