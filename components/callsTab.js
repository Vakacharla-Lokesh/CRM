class CallsContent extends HTMLElement {
  constructor() {
    super();
    this.calls = [];
    this.leadId = null;
  }

  connectedCallback() {
    this.leadId = this.getAttribute("lead-id");
    this.loadCallsData();
  }

  async loadCallsData() {
    try {
      if (!this.leadId) {
        this.renderEmptyState("No lead ID found");
        return;
      }

      const dbWorker = window.dbWorker;
      if (!dbWorker) {
        this.renderEmptyState("Database not available");
        return;
      }

      const calls = await this.fetchCallsByLeadId(
        this.leadId,
        dbWorker,
      );

      if (calls && calls.length > 0) {
        this.calls = calls;
        this.renderCalls(calls);
      } else {
        this.calls = [];
        this.renderEmptyState("No calls logged yet");
      }
    } catch (error) {
      console.error("Error loading calls:", error);
      this.renderEmptyState("Error loading calls");
    }
  }

  fetchCallsByLeadId(leadId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, rows, error, storeName } = e.data;

        if (action === "getAllSuccess" && storeName === "Calls") {
          dbWorker.removeEventListener("message", messageHandler);

          // Filter calls for this specific lead
          const leadCalls = (rows || []).filter(
            (call) => call.lead_id == leadId,
          );
          resolve(leadCalls);
        } else if (action === "getAllError" && storeName === "Calls") {
          dbWorker.removeEventListener("message", messageHandler);
          resolve([]);
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "getAllCalls",
        storeName: "Calls",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        resolve([]);
      }, 5000);
    });
  }

  renderCalls(calls) {
    const callsHTML = calls
      .sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
      .map((call) => {
        const typeColor =
          call.call_type === "incoming"
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
            : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";

        const statusColor =
          {
            completed:
              "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
            missed:
              "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
            "no-answer":
              "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
            voicemail:
              "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
          }[call.call_status] ||
          "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";

        const typeIcon =
          call.call_type === "incoming"
            ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
             </svg>`
            : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 3h5m0 0v5m0-5l-6 6M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"/>
             </svg>`;

        return `
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeColor}">
                  ${typeIcon}
                  ${this.capitalize(call.call_type || "Unknown")}
                </span>
                <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}">
                  ${this.capitalize(call.call_status || "Unknown")}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  data-call-id="${call.call_id}" 
                  class="edit-call-btn text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Edit call"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button 
                  data-call-id="${call.call_id}" 
                  class="delete-call-btn text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete call"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="space-y-2">
              ${
                call.call_notes
                  ? `
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  <span class="font-medium">Notes:</span> ${this.escapeHtml(call.call_notes)}
                </p>
              `
                  : ""
              }
              
              <div class="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Duration: ${this.formatDuration(call.duration)}</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>${call.created_on ? new Date(call.created_on).toLocaleString() : "—"}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    this.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Call History (${calls.length})
          </h2>
          <button id="add-call-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            + Log Call
          </button>
        </div>
        
        <div id="calls-list" class="space-y-3">
          ${callsHTML}
        </div>
      </div>

      ${this.renderCallModal()}
    `;

    this.setupEventListeners();
  }

  renderEmptyState(message) {
    this.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-20">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400 mb-4">${message}</p>
        <button id="add-call-empty-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          + Log Call
        </button>
      </div>
    `;

    this.setupEmptyStateListeners();
  }

  renderCallModal(call = null) {
    const isEdit = !!call;
    const modalTitle = isEdit ? "Edit Call" : "Log New Call";
    const submitText = isEdit ? "Update Call" : "Log Call";

    return `
      <div id="call-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="relative w-full max-w-lg p-4 mx-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${modalTitle}</h3>
              <button id="close-call-modal" type="button" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form id="call-form" class="px-6 py-4">
              <input type="hidden" id="call-id" value="${call?.call_id || ""}">
              
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label for="call-type" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Call Type <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="call-type"
                    required
                    class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select type</option>
                    <option value="incoming" ${call?.call_type === "incoming" ? "selected" : ""}>Incoming</option>
                    <option value="outgoing" ${call?.call_type === "outgoing" ? "selected" : ""}>Outgoing</option>
                  </select>
                </div>

                <div>
                  <label for="call-status" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="call-status"
                    required
                    class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select status</option>
                    <option value="completed" ${call?.call_status === "completed" ? "selected" : ""}>Completed</option>
                    <option value="missed" ${call?.call_status === "missed" ? "selected" : ""}>Missed</option>
                    <option value="no-answer" ${call?.call_status === "no-answer" ? "selected" : ""}>No Answer</option>
                    <option value="voicemail" ${call?.call_status === "voicemail" ? "selected" : ""}>Voicemail</option>
                  </select>
                </div>
              </div>

              <div class="mb-4">
                <label for="call-duration" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration (seconds) <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="call-duration"
                  min=10
                  max=1000
                  required
                  value="${call?.duration || ""}"
                  class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 120"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter duration in seconds</p>
              </div>

              <div class="mb-6">
                <label for="call-notes" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Call Notes
                </label>
                <textarea
                  id="call-notes"
                  rows="4"
                  class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Add notes about the call..."
                >${call?.call_notes || ""}</textarea>
              </div>

              <div class="flex gap-3">
                <button
                  type="submit"
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
                >
                  ${submitText}
                </button>
                <button
                  type="button"
                  id="cancel-call-btn"
                  class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const addBtn = this.querySelector("#add-call-btn");
    const editButtons = this.querySelectorAll(".edit-call-btn");
    const deleteButtons = this.querySelectorAll(".delete-call-btn");

    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal());
    }

    editButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const callId = Number(btn.getAttribute("data-call-id"));
        this.handleEditCall(callId);
      });
    });

    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const callId = Number(btn.getAttribute("data-call-id"));
        this.handleDeleteCall(callId);
      });
    });

    this.setupModalListeners();
  }

  setupEmptyStateListeners() {
    const addBtn = this.querySelector("#add-call-empty-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        this.renderEmptyWithModal();
      });
    }
  }

  renderEmptyWithModal() {
    this.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-20">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400">No calls logged yet</p>
      </div>
      ${this.renderCallModal()}
    `;

    this.setupModalListeners();
    this.openModal();
  }

  setupModalListeners() {
    const modal = this.querySelector("#call-modal");
    const closeBtn = this.querySelector("#close-call-modal");
    const cancelBtn = this.querySelector("#cancel-call-btn");
    const form = this.querySelector("#call-form");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.closeModal());
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmitCall();
      });
    }
  }

  openModal() {
    const modal = this.querySelector("#call-modal");
    if (modal) {
      modal.classList.remove("hidden");
      setTimeout(() => {
        const typeInput = this.querySelector("#call-type");
        if (typeInput) typeInput.focus();
      }, 100);
    }
  }

  closeModal() {
    const modal = this.querySelector("#call-modal");
    const form = this.querySelector("#call-form");

    if (modal) {
      modal.classList.add("hidden");
    }

    if (form) {
      form.reset();
    }
  }

  async handleSubmitCall() {
    const callIdInput = this.querySelector("#call-id");
    const typeInput = this.querySelector("#call-type");
    const statusInput = this.querySelector("#call-status");
    const durationInput = this.querySelector("#call-duration");
    const notesInput = this.querySelector("#call-notes");

    const callId = callIdInput?.value;
    const type = typeInput?.value?.trim();
    const status = statusInput?.value?.trim();
    const duration = Number(durationInput?.value);
    const notes = notesInput?.value?.trim();

    if (!type || !status || !duration) {
      alert("Please fill in all required fields");
      return;
    }

    const dbWorker = window.dbWorker;
    if (!dbWorker) {
      alert("Database not available");
      return;
    }

    const callData = {
      call_id: callId ? Number(callId) : Date.now(),
      lead_id: this.leadId,
      call_type: type,
      call_status: status,
      duration: duration,
      call_notes: notes || "",
      created_on: callId
        ? this.calls.find((c) => c.call_id === Number(callId))?.created_on
        : new Date(),
      modified_on: new Date(),
    };

    try {
      if (callId) {
        await this.updateCall(callData, dbWorker);
        this.showNotification("Call updated successfully!", "success");
      } else {
        await this.createCall(callData, dbWorker);
        this.showNotification("Call logged successfully!", "success");
      }

      this.closeModal();
      this.loadCallsData();
    } catch (error) {
      console.error("Error saving call:", error);
      alert("Error saving call: " + error.message);
    }
  }

  handleEditCall(callId) {
    const call = this.calls.find((c) => c.call_id === callId);
    if (!call) return;

    // Re-render with the modal populated
    const modalHTML = this.renderCallModal(call);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = modalHTML;

    const existingModal = this.querySelector("#call-modal");
    if (existingModal) {
      existingModal.remove();
    }

    this.appendChild(tempDiv.firstElementChild);
    this.setupModalListeners();
    this.openModal();
  }

  async handleDeleteCall(callId) {
    if (!confirm("Are you sure you want to delete this call?")) {
      return;
    }

    const dbWorker = window.dbWorker;
    if (!dbWorker) {
      alert("Database not available");
      return;
    }

    try {
      await this.deleteCall(callId, dbWorker);
      this.loadCallsData();
      this.showNotification("Call deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting call:", error);
      alert("Error deleting call: " + error.message);
    }
  }

  createCall(callData, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, error, storeName } = e.data;

        if (action === "insertSuccess" && storeName === "Calls") {
          dbWorker.removeEventListener("message", messageHandler);
          resolve();
        } else if (action === "insertError" && storeName === "Calls") {
          dbWorker.removeEventListener("message", messageHandler);
          reject(new Error(error || "Failed to create call"));
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "createCall",
        callData,
        storeName: "Calls",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        reject(new Error("Request timeout"));
      }, 5000);
    });
  }

  updateCall(callData, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, error, storeName } = e.data;

        if (action === "updateSuccess" && storeName === "Calls") {
          dbWorker.removeEventListener("message", messageHandler);
          resolve();
        } else if (action === "updateError" && storeName === "Calls") {
          dbWorker.removeEventListener("message", messageHandler);
          reject(new Error(error || "Failed to update call"));
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "updateCall",
        callData,
        storeName: "Calls",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        reject(new Error("Request timeout"));
      }, 5000);
    });
  }

  deleteCall(callId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, error, storeName } = e.data;

        if (action === "deleteSuccess" && storeName === "Calls") {
          dbWorker.removeEventListener("message", messageHandler);
          resolve();
        } else if (action === "deleteError" && storeName === "Calls") {
          dbWorker.removeEventListener("message", messageHandler);
          reject(new Error(error || "Failed to delete call"));
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "deleteCall",
        id: callId,
        storeName: "Calls",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        reject(new Error("Request timeout"));
      }, 5000);
    });
  }

  formatDuration(seconds) {
    if (!seconds || seconds === 0) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg transition-all transform translate-x-0 z-50 ${
      type === "success"
        ? "bg-green-500 text-white"
        : type === "error"
          ? "bg-red-500 text-white"
          : "bg-blue-500 text-white"
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(400px)";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

customElements.define("calls-content", CallsContent);
