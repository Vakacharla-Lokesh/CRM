class LeadPage extends HTMLElement {
  connectedCallback() {
    this.style.display = "block";
    this.style.width = "100%";
    // this.style.minHeight = "100vh";

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
    const status = this.leadData.lead_status;

    this.innerHTML = `
            <div class="w-full mx-auto bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="w-full flex flex-row justify-between items-center gap-4">
                  <div class="flex flex-row items-center">
                    <button
                      id="back-to-leads"
                      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back
                    </button>
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
    if (convertToDealBtn && status != "Converted") {
      const leadId = sessionStorage.getItem("lead_id");
      convertToDealBtn.addEventListener("click", () => {
        if (
          confirm(
            "Convert this lead to a deal? The lead will be marked as 'Converted'.",
          )
        ) {
          dbWorker.postMessage({ action: "convertToDeal", lead_id: leadId });
        }
      });
    } else if(status == "Converted"){
      convertToDealBtn.classList.add("hidden");
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
