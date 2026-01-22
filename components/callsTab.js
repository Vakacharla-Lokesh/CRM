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
    `,
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
