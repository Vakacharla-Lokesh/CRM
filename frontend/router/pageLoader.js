export class PageLoader {
  constructor() {
    this.loadedScripts = new Set();
    
    // Route scripts mapping
    this.routeScripts = {
      "/login": "/js/login.js",
      "/signup": "/js/signup.js",
      "/deals": "/js/deals.js",
    };
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
    const scriptPath = this.routeScripts[path];

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
