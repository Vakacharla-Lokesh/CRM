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

  async render(activeTab) {
    const leadId = sessionStorage.getItem("lead_id");
    
    let content = '';
    
    switch(activeTab) {
      case 'details':
        content = `<lead-details></lead-details>`;
        break;
      case 'calls':
        content = `<calls-content lead-id="${leadId}"></calls-content>`;
        break;
      case 'comments':
        content = `<comments-content lead-id="${leadId}"></comments-content>`;
        break;
      case 'attachments':
        content = `<attachments-content lead-id="${leadId}"></attachments-content>`;
        break;
      default:
        content = `<lead-details></lead-details>`;
    }

    this.innerHTML = `
          <div class="p-6 bg-white dark:bg-gray-800">
            ${content}
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

class CallsContent extends HTMLElement {
  connectedCallback() {
    this.loadCallsData();
  }

  async loadCallsData() {
    try {
      const leadId = this.getAttribute("lead-id");
      if (!leadId) {
        this.renderEmptyState("No lead ID found");
        return;
      }

      const dbWorker = window.dbWorker;
      if (!dbWorker) {
        this.renderEmptyState("Database not available");
        return;
      }

      const calls = await this.fetchCallsById(Number(leadId), dbWorker);
      
      if (calls && calls.length > 0) {
        this.renderCalls(calls);
      } else {
        this.renderEmptyState("No calls logged yet");
      }
    } catch (error) {
      console.error("Error loading calls:", error);
      this.renderEmptyState("Error loading calls");
    }
  }

  fetchCallsById(leadId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, data, error, id } = e.data;

        if (action === "getByIdSuccess" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve(data || []);
        } else if (action === "getByIdError" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve([]);
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "getCallsById",
        storeName: "Calls",
        id: leadId,
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        resolve([]);
      }, 5000);
    });
  }

  renderCalls(calls) {
    const callsHTML = calls
      .map(
        (call) => `
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold text-gray-900 dark:text-white">${call.call_type || "Call"}</h3>
          <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">${call.call_status || "Completed"}</span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${call.call_notes || "No notes"}</p>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          <p>Duration: ${call.call_duration || "—"}</p>
          <p>Date: ${call.call_date ? new Date(call.call_date).toLocaleDateString() : "—"}</p>
        </div>
      </div>
    `
      )
      .join("");

    this.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Calls</h2>
          <button id="add-call" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
            + Add Call
          </button>
        </div>
        ${callsHTML}
      </div>
    `;
  }

  renderEmptyState(message) {
    this.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-20">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400">${message}</p>
        <button id="add-call-empty" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
          + Add Call
        </button>
      </div>
    `;
  }
}

customElements.define("calls-content", CallsContent);

class CommentsContent extends HTMLElement {
  connectedCallback() {
    this.loadCommentsData();
  }

  async loadCommentsData() {
    try {
      const leadId = this.getAttribute("lead-id");
      if (!leadId) {
        this.renderEmptyState("No lead ID found");
        return;
      }

      const dbWorker = window.dbWorker;
      if (!dbWorker) {
        this.renderEmptyState("Database not available");
        return;
      }

      const comments = await this.fetchCommentsById(Number(leadId), dbWorker);
      
      if (comments && comments.length > 0) {
        this.renderComments(comments);
      } else {
        this.renderEmptyState("No comments added yet");
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      this.renderEmptyState("Error loading comments");
    }
  }

  fetchCommentsById(leadId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, data, error, id } = e.data;

        if (action === "getByIdSuccess" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve(data || []);
        } else if (action === "getByIdError" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve([]);
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
        resolve([]);
      }, 5000);
    });
  }

  renderComments(comments) {
    const commentsHTML = comments
      .map(
        (comment) => `
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold text-gray-900 dark:text-white">${comment.comment_by || "Unknown User"}</h3>
          <span class="text-xs text-gray-500 dark:text-gray-400">${comment.comment_date ? new Date(comment.comment_date).toLocaleDateString() : "—"}</span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300">${comment.comment_text || "No content"}</p>
      </div>
    `
      )
      .join("");

    this.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
          <button id="add-comment" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
            + Add Comment
          </button>
        </div>
        ${commentsHTML}
      </div>
    `;
  }

  renderEmptyState(message) {
    this.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-20">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400">${message}</p>
        <button id="add-comment-empty" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
          + Add Comment
        </button>
      </div>
    `;
  }
}

customElements.define("comments-content", CommentsContent);

class AttachmentsContent extends HTMLElement {
  connectedCallback() {
    this.loadAttachmentsData();
  }

  async loadAttachmentsData() {
    try {
      const leadId = this.getAttribute("lead-id");
      if (!leadId) {
        this.renderEmpty();
        return;
      }

      const dbWorker = window.dbWorker;
      if (!dbWorker) {
        this.renderEmpty();
        return;
      }

      const attachments = await this.fetchAttachmentsById(Number(leadId), dbWorker);
      
      if (attachments && attachments.length > 0) {
        this.renderAttachments(attachments);
      } else {
        this.renderEmpty();
      }
    } catch (error) {
      console.error("Error loading attachments:", error);
      this.renderEmpty();
    }
  }

  fetchAttachmentsById(leadId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, data, error, id } = e.data;

        if (action === "getByIdSuccess" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve(data || []);
        } else if (action === "getByIdError" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve([]);
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "getAttachmentsById",
        storeName: "Attachments",
        id: leadId,
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        resolve([]);
      }, 5000);
    });
  }

  renderAttachments(attachments) {
    const attachmentsHTML = attachments
      .map(
        (attachment) => `
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">${attachment.file_name || "Attachment"}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">${attachment.file_size || "—"} • ${attachment.upload_date ? new Date(attachment.upload_date).toLocaleDateString() : "—"}</p>
          </div>
        </div>
        <a href="${attachment.file_url || "#"}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
          Download
        </a>
      </div>
    `
      )
      .join("");

    this.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Attachments</h2>
          <button id="add-attachment" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
            + Upload File
          </button>
        </div>
        ${attachmentsHTML}
      </div>
    `;
  }

  renderEmpty() {
    this.innerHTML = `
      <div class="flex flex-col items-center justify-center w-full">
        <label for="dropzone-file-${Date.now()}" class="flex flex-col items-center justify-center w-full h-64 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg class="w-12 h-12 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <p class="mb-2 text-sm text-gray-700 dark:text-gray-300"><span class="font-semibold">Click to upload</span> or drag and drop</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, PDF, DOC (MAX. 10MB)</p>
          </div>
          <input id="dropzone-file-${Date.now()}" type="file" class="hidden" />
        </label>
      </div> 
    `;
  }

  
}

customElements.define("attachments-content", AttachmentsContent);
