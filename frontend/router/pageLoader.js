import { RouteManager } from "./routeManager.js";

export class PageLoader {
  constructor() {
    this.routeManager = new RouteManager();
    this.loadedScripts = new Set();
  }

  async loadPage(routePath) {
    try {
      const response = await fetch(routePath);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const html = await blob.text();

      return html;
    } catch (error) {
      console.error("Error loading page:", error);
      throw error;
    }
  }

  async loadPageScript(path) {
    const scriptPath = this.routeManager.getRouteScript(path);

    if (!scriptPath) return;

    // Clear previous scripts
    this.loadedScripts.forEach((scriptUrl) => {
      const existingScript = document.querySelector(
        `script[src="${scriptUrl}"]`,
      );
      if (existingScript) {
        existingScript.remove();
      }
    });
    this.loadedScripts.clear();

    // Load new script
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "module";
      script.src = scriptPath;

      script.onload = () => {
        this.loadedScripts.add(scriptPath);
        resolve();
      };

      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
}
