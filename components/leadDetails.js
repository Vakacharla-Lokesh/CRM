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

      this.leadData = await this.fetchLeadById(Number(leadId), dbWorker);
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
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, data, error, id } = e.data;

        if (action === "getByIdSuccess" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve(data);
        } else if (action === "getByIdError" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
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

        if (action === "getByIdSuccess" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve(data);
        } else if (action === "getByIdError" && id === leadId) {
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
                <div class="flex items-center gap-4">
                  <button id="back-to-leads" class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    < Back
                  </button>
                  <div>
                    <h1 class="text-xl font-semibold text-gray-900 dark:text-white">${fullName}</h1>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Lead ID: ${leadId}</p>
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

class TabHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
          <div class="border-b bg-white dark:bg-gray-800">
            <div class="flex gap-6 px-6 py-3 text-sm font-medium">
              ${["Details", "Calls", "Comments", "Attachments"]
                .map(
                  (tab, i) => `
                <button
                  data-tab="${tab.toLowerCase()}"
                  class="tab-btn pb-2 ${
                    i === 0
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }"
                >
                  ${tab}
                </button>
              `,
                )
                .join("")}
            </div>
          </div>
        `;
  }
}
customElements.define("tab-header", TabHeader);

class TabContent extends HTMLElement {
  connectedCallback() {
    this.render("details");
  }

  render(activeTab) {
    const views = {
      details: `<lead-details></lead-details>`,
      calls: `<empty-state title="No calls logged yet"></empty-state>`,
      comments: `<empty-state title="No comments added"></empty-state>`,
      attachments: `<empty-state title="No files attached"></empty-state>`,
    };

    this.innerHTML = `
          <div class="p-6 bg-white dark:bg-gray-800">
            ${views[activeTab]}
          </div>
        `;
  }
}
customElements.define("tab-content", TabContent);

class LeadDetails extends HTMLElement {
  connectedCallback() {
    this.loadLeadData();
  }

  async loadLeadData() {
    try {
      const leadId = sessionStorage.getItem("lead_id");
      if (!leadId) {
        this.innerHTML = `
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6 max-w-xl">
                  <p class="text-red-600 dark:text-red-400">Error: No lead ID found</p>
                </div>
              `;
        return;
      }

      const dbWorker = window.dbWorker;
      if (!dbWorker) {
        this.innerHTML = `
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6 max-w-xl">
                  <p class="text-red-600 dark:text-red-400">Error: Database not available</p>
                </div>
              `;
        return;
      }

      const lead = await this.fetchLeadById(Number(leadId), dbWorker);

      if (lead) {
        this.render(lead);
      } else {
        this.innerHTML = `
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6 max-w-xl">
                  <p class="text-red-600 dark:text-red-400">Error: Lead not found</p>
                </div>
              `;
      }
    } catch (error) {
      console.error("Error loading lead details:", error);
      this.innerHTML = `
              <div class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6 max-w-xl">
                <p class="text-red-600 dark:text-red-400">Error: ${error.message}</p>
              </div>
            `;
    }
  }

  fetchLeadById(leadId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, data, error, id } = e.data;

        if (action === "getByIdSuccess" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve(data);
        } else if (action === "getByIdError" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
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

  render(lead) {
    const firstName = lead.lead_first_name || "—";
    const lastName = lead.lead_last_name || "—";
    const email = lead.lead_email || "—";
    const mobile = lead.lead_mobile_number || "—";
    const organization = lead.organization_name || "—";
    const createdDate = lead.created_on
      ? new Date(lead.created_on).toLocaleDateString()
      : "—";

    this.innerHTML = `
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6 max-w-xl">
              <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Lead Details</h2>

              <div class="space-y-3 text-sm">
                ${this.row("Lead ID", lead.lead_id)}
                ${this.row("First Name", firstName)}
                ${this.row("Last Name", lastName)}
                ${this.row("Email", email)}
                ${this.row("Mobile", mobile)}
                ${this.row("Organization", organization)}
                ${this.row("Created Date", createdDate)}
                ${this.row("Lead Score", lead.lead_score || "—")}
              </div>
            </div>
          `;
  }

  row(label, value) {
    return `
            <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span class="text-gray-500 dark:text-gray-400">${label}</span>
              <span class="font-medium text-gray-900 dark:text-white">${value}</span>
            </div>
          `;
  }
}
customElements.define("lead-details", LeadDetails);

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

class Attachments extends HTMLElement {}

customElements.define("attachments-content", Attachments);

class Comments extends HTMLElement {}

customElements.define("comments-content", Comments);
