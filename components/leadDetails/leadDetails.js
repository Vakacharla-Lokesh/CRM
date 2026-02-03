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

      const lead = await this.fetchLeadById(leadId, dbWorker);

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
    const organization_name = lead.organization_name || "—";
    const organization_size = lead.organization_size || "0";
    const createdDate = lead.created_on
      ? new Date(lead.created_on).toLocaleDateString()
      : "—";

    this.leadData = lead;
    const status = lead.lead_status || "New";

    this.innerHTML = `
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6 max-w-xl">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Lead Details</h2>
                <button id="edit-lead-btn" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors">
                  Edit Lead
                </button>
              </div>

              <div class="space-y-3 text-sm">
                ${this.row("Lead ID", lead.lead_id)}
                ${this.row("First Name", firstName)}
                ${this.row("Last Name", lastName)}
                ${this.row("Email", email)}
                ${this.row("Mobile", mobile)}
                ${this.row("Organization Name", organization_name)}
                ${this.row("Organization Size", organization_size)}
                ${this.row("Created Date", createdDate)}
                ${this.row("Lead Score", lead.score || "—")}
              </div>
            </div>

            <!-- Edit Modal -->
            <div id="edit-lead-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
              <div class="relative w-full max-w-2xl p-4 mx-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                  <!-- Modal Header -->
                  <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Lead</h3>
                    <button id="close-edit-modal" type="button" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Modal Body -->
                  <form class="px-6 py-4" id="edit-lead-form">
                    <div class="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label for="edit_first_name" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                          First Name <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="edit_first_name"
                          required
                          class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value="${lead.lead_first_name || ""}"
                        />
                      </div>
                      <div>
                        <label for="edit_last_name" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="edit_last_name"
                          class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value="${lead.lead_last_name || ""}"
                        />
                      </div>
                      <div>
                        <label for="edit_email" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="edit_email"
                          required
                          class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value="${lead.lead_email || ""}"
                        />
                      </div>
                      <div>
                        <label for="edit_mobile" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          id="edit_mobile"
                          class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value="${lead.lead_mobile_number || ""}"
                        />
                      </div>
                      <div>
                        <label 
                          for="edit_status" 
                          class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Status
                        </label>
                        <select 
                          id="edit_status"
                          class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"  
                        >
                          <option value="New" ${status === "New" ? "selected" : ""}>New</option>
                          <option value="Converted" ${status === "Converted" ? "selected" : ""}>Converted</option>
                          <option value="Dead" ${status === "Dead" ? "selected" : ""}>Dead</option>
                          <option value="Follow-Up" ${status === "Follow-Up" ? "selected" : ""}>Follow-Up</option>
                        </select>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-3">
                      <button
                        type="submit"
                        class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        id="cancel-edit-btn"
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

    this.setupEditListeners();
  }

  setupEditListeners() {
    const editBtn = this.querySelector("#edit-lead-btn");
    const editModal = this.querySelector("#edit-lead-modal");
    const closeBtn = this.querySelector("#close-edit-modal");
    const cancelBtn = this.querySelector("#cancel-edit-btn");
    const editForm = this.querySelector("#edit-lead-form");

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        editModal?.classList.remove("hidden");
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        editModal?.classList.add("hidden");
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        editModal?.classList.add("hidden");
      });
    }

    if (editForm) {
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveChanges();
      });
    }

    // Close modal when clicking outside
    if (editModal) {
      editModal.addEventListener("click", (e) => {
        if (e.target === editModal) {
          editModal.classList.add("hidden");
        }
      });
    }
  }

  handleSaveChanges() {
    const firstName =
      document.getElementById("edit_first_name")?.value?.trim() || "";
    const lastName =
      document.getElementById("edit_last_name")?.value?.trim() || "";
    const email = document.getElementById("edit_email")?.value?.trim() || "";
    const mobile = document.getElementById("edit_mobile")?.value?.trim() || "";
    const status =
      document.getElementById("edit_status")?.value?.trim() || "New";

    if (!firstName || !email) {
      alert("Please fill in all required fields");
      return;
    }

    const dbWorker = window.dbWorker;
    if (!dbWorker) {
      alert("Database not available");
      return;
    }

    const updatedLeadData = {
      ...this.leadData,
      lead_first_name: firstName,
      lead_last_name: lastName,
      lead_email: email,
      lead_mobile_number: mobile,
      lead_status: status,
      modified_on: new Date(),
    };

    const messageHandler = (e) => {
      const { action, error, id } = e.data;

      if (action === "updateSuccess" && id === updatedLeadData.lead_id) {
        dbWorker.removeEventListener("message", messageHandler);
        // alert("Lead updated successfully!");
        this.leadData = updatedLeadData;
        document.getElementById("edit-lead-modal")?.classList.add("hidden");
        this.loadLeadData();
      } else if (action === "updateError" && id === updatedLeadData.lead_id) {
        dbWorker.removeEventListener("message", messageHandler);
        alert("Error updating lead: " + error);
      }
    };

    dbWorker.addEventListener("message", messageHandler);
    dbWorker.postMessage({
      action: "updateLead",
      leadData: updatedLeadData,
      storeName: "Leads",
    });

    setTimeout(() => {
      dbWorker.removeEventListener("message", messageHandler);
    }, 5000);
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
