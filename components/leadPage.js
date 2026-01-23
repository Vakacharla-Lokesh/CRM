class LeadPage extends HTMLElement {
  connectedCallback() {
    this.style.display = "block";
    this.style.width = "100%";
    this.style.minHeight = "100vh";

    this.leadData = null;
    this.loadLeadHeader();
  }

  async loadLeadHeader() {
    try {
      const leadId = sessionStorage.getItem("lead_id");
      if (!leadId) {
        this.innerHTML = `
                <div class="w-full mx-auto mt-6 bg-red-50 rounded-lg p-6 text-red-600">
                  <p>Error: No lead ID found</p>
                </div>
              `;
        return;
      }

      const dbWorker = window.dbWorker;
      if (!dbWorker) {
        this.innerHTML = `
                <div class="w-full mx-auto mt-6 bg-red-50 rounded-lg p-6 text-red-600">
                  <p>Error: Database not available</p>
                </div>
              `;
        return;
      }

      this.leadData = await this.fetchLeadById(leadId, dbWorker);
      this.renderPage();
    } catch (error) {
      console.error("Error loading lead:", error);
      this.innerHTML = `
              <div class="w-full mx-auto mt-6 bg-red-50 rounded-lg p-6 text-red-600">
                <p>Error: ${error.message}</p>
              </div>
            `;
    }
  }

  fetchLeadById(leadId, dbWorker) {
    console.log(leadId);
    console.log("Inside fetch Lead by Id");
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, data, error, id } = e.data;

        if (action === "getByIdSuccess" && id == leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve(data);
        } else if (action === "getByIdError" && id == leadId) {
          // dbWorker.removeEventListener("message", messageHandler);
          dbWorker.postMessage({ action: "initialize" });
          // return;
          reject(new Error(error || "Failed to fetch lead"));
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "getLeadById",
        storeName: "Leads",
        id: leadId,
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        reject(new Error("Request timeout"));
      }, 5000);
    });
  }

  fetchCommentsById(leadId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, data, error, id } = e.data;

        if (action === "getByIdSuccess" && id == leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve(data);
        } else if (action === "getByIdError" && id == leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          reject(new Error(error || "Failed to fetch lead"));
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "getCommentsById",
        storeName: "Comments",
        id: leadId,
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        reject(new Error("Request timeout"));
      }, 5000);
    });
  }

  renderPage() {
    const fullName =
      `${this.leadData.lead_first_name || ""} ${
        this.leadData.lead_last_name || ""
      }`.trim() || "Unknown Lead";
    const leadId = this.leadData.lead_id;

    this.innerHTML = `
            <div class="w-full mx-auto bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="w-full flex flex-row justify-between items-center gap-4">
                  <div class="flex flex-row items-center">
                    <button id="back-to-leads" class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      < Back
                    </button>
                    <div>
                      <p class="text-xl font-semibold text-gray-900 dark:text-white">${fullName}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Lead ID: ${leadId}</p>
                    </div>
                  </div>
                  <div class="">
                    <button id="convert-to-lead" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors">
                      Convert to Deal
                    </button>
                  </div>
                </div>
              </div>

              <tab-header></tab-header>
              <tab-content></tab-content>
            </div>
          `;

    const backBtn = this.querySelector("#back-to-leads");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (window.router && window.router.loadRoute) {
          window.router.loadRoute("/leads");
        }
      });
    }

    const convertToDealBtn = this.querySelector("#convert-to-lead");
    if (convertToDealBtn) {
      const leadId = sessionStorage.getItem("lead_id");
      convertToDealBtn.addEventListener("click", () => {
        dbWorker.postMessage({ action: "convertToDeal", lead_id: leadId });
        if (window.router && window.router.loadRoute) {
          window.router.loadRoute("/leads");
        }
      });
    }

    this.setupTabs();
  }

  setupTabs() {
    const content = this.querySelector("tab-content");
    const buttons = this.querySelectorAll(".tab-btn");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) =>
          b.classList.remove("border-b-2", "border-black", "text-black"),
        );
        buttons.forEach((b) => b.classList.add("text-gray-500"));

        btn.classList.add("border-b-2", "border-black", "text-black");
        btn.classList.remove("text-gray-500");

        content.render(btn.dataset.tab);
      });
    });
  }
}

customElements.define("lead-page", LeadPage);

class EmptyState extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || "Nothing here";
    this.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center py-20 text-gray-400 dark:text-gray-500">
              <p class="text-sm">${title}</p>
            </div>
          `;
  }
}
customElements.define("empty-state", EmptyState);
