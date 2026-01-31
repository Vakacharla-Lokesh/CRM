export class LeadSelect {
  constructor(containerId, dbWorker) {
    this.containerId = containerId;
    this.dbWorker = dbWorker;
    this.leads = [];
    this.selectedLead = null;
    this.isOpen = false;
  }

  async initialize() {
    await this.loadLeads();
    this.render();
    this.attachEventListeners();
  }

  loadLeads() {
    const user = JSON.parse(localStorage.getItem("user"));
    return new Promise((resolve) => {
      const handler = (e) => {
        const { action, data, storeName } = e.data;

        if (action === "getAllSuccess" && storeName === "Leads") {
          this.dbWorker.removeEventListener("message", handler);
          this.leads = data || [];
          resolve();
        }
      };

      this.dbWorker.addEventListener("message", handler);
      this.dbWorker.postMessage({
        action: "getAllLeads",
        storeName: "Leads",
        user_id: user?.user_id,
        tenant_id: user?.tenant_id,
        role: user?.role,
      });

      setTimeout(() => {
        this.dbWorker.removeEventListener("message", handler);
        resolve();
      }, 3000);
    });
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="relative">
        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Lead <span class="text-xs text-gray-500">(Optional)</span>
        </label>
        
        <div class="relative">
          <input
            type="text"
            id="lead-search-input"
            placeholder="Search existing leads..."
            autocomplete="off"
            class="w-full px-3 py-2 pr-10 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          
          <button type="button" id="lead-dropdown-btn" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>

        <!-- Dropdown Menu -->
        <div id="lead-dropdown" class="hidden absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div id="lead-list" class="py-1"></div>
        </div>

        <!-- Selected Lead Display -->
        <div id="lead-selected-display" class="hidden mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-900 dark:text-green-100" id="lead-display-name"></p>
              <p class="text-xs text-green-700 dark:text-green-300" id="lead-display-details"></p>
            </div>
            <button type="button" id="lead-clear-btn" class="text-green-600 dark:text-green-400 hover:text-green-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Hidden field to store selected lead ID -->
        <input type="hidden" id="selected_lead_id" name="selected_lead_id" value="" />
      </div>
    `;
  }

  attachEventListeners() {
    const searchInput = document.getElementById("lead-search-input");
    const dropdownBtn = document.getElementById("lead-dropdown-btn");
    const clearBtn = document.getElementById("lead-clear-btn");

    if (searchInput) {
      searchInput.addEventListener("focus", () => {
        this.showDropdown();
      });

      searchInput.addEventListener("blur", () => {
        // Delay to allow click events on dropdown items
        setTimeout(() => this.hideDropdown(), 150);
      });

      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        this.filterLeads(query);

        if (query && !this.isOpen) {
          this.showDropdown();
        }
      });
    }

    if (dropdownBtn) {
      dropdownBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleDropdown();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearSelection();
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(`#${this.containerId}`)) {
        this.hideDropdown();
      }
    });
  }

  filterLeads(query) {
    const leadList = document.getElementById("lead-list");
    if (!leadList) return;

    const filtered = this.leads.filter((lead) => {
      const fullName = `${lead.lead_first_name || ''} ${lead.lead_last_name || ''}`.toLowerCase();
      const email = (lead.lead_email || '').toLowerCase();
      const company = (lead.lead_company || '').toLowerCase();
      return fullName.includes(query) || email.includes(query) || company.includes(query);
    });

    if (filtered.length === 0) {
      leadList.innerHTML = `
        <div class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
          No matching leads found
        </div>
      `;
    } else {
      leadList.innerHTML = filtered
        .map(
          (lead) => `
        <div class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0" data-lead-id="${lead.lead_id}">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">${this.escapeHtml(`${lead.lead_first_name || ''} ${lead.lead_last_name || ''}`.trim() || 'Unnamed Lead')}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            ${lead.lead_email ? this.escapeHtml(lead.lead_email) : ''} 
            ${lead.lead_company ? `• ${this.escapeHtml(lead.lead_company)}` : ""}
          </p>
        </div>
      `,
        )
        .join("");
    }

    leadList.querySelectorAll("[data-lead-id]").forEach((item) => {
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const leadId = e.currentTarget.getAttribute("data-lead-id");
        this.selectLead(leadId);
      });
    });
  }

  selectLead(leadId) {
    const lead = this.leads.find((l) => l.lead_id === leadId);
    if (!lead) return;

    this.selectedLead = lead;
    this.updateFormFields(lead);
    this.showSelectedDisplay(lead);
    this.hideDropdown();
  }

  updateFormFields(lead) {
    // Update the hidden lead_id field
    const hiddenLeadIdField = document.getElementById("selected_lead_id");
    if (hiddenLeadIdField) {
      hiddenLeadIdField.value = lead.lead_id;
    }

    // Also update any existing lead_id select/input if present
    const leadIdField = document.getElementById("lead_id");
    if (leadIdField && leadIdField.tagName === 'SELECT') {
      leadIdField.value = lead.lead_id;
    } else if (leadIdField && leadIdField.tagName === 'INPUT') {
      leadIdField.value = lead.lead_id;
    }
  }

  showSelectedDisplay(lead) {
    const display = document.getElementById("lead-selected-display");
    const nameEl = document.getElementById("lead-display-name");
    const detailsEl = document.getElementById("lead-display-details");
    const searchInput = document.getElementById("lead-search-input");

    const fullName = `${lead.lead_first_name || ''} ${lead.lead_last_name || ''}`.trim() || 'Unnamed Lead';

    if (display && nameEl && detailsEl) {
      nameEl.textContent = fullName;
      detailsEl.textContent = `${lead.lead_email || 'No email'} • ${lead.lead_company || 'No company'}`;
      display.classList.remove("hidden");
    }

    if (searchInput) {
      searchInput.value = fullName;
    }
  }

  hideSelectedDisplay() {
    const display = document.getElementById("lead-selected-display");
    if (display) {
      display.classList.add("hidden");
    }
  }

  clearSelection() {
    this.selectedLead = null;
    const searchInput = document.getElementById("lead-search-input");
    if (searchInput) {
      searchInput.value = "";
    }
    this.hideSelectedDisplay();

    // Clear the hidden field
    const hiddenLeadIdField = document.getElementById("selected_lead_id");
    if (hiddenLeadIdField) {
      hiddenLeadIdField.value = "";
    }

    // Clear any existing lead_id field
    const leadIdField = document.getElementById("lead_id");
    if (leadIdField) {
      leadIdField.value = "";
    }
  }

  showDropdown() {
    const dropdown = document.getElementById("lead-dropdown");
    if (dropdown) {
      dropdown.classList.remove("hidden");
      this.isOpen = true;
      const searchInput = document.getElementById("lead-search-input");
      const query = searchInput ? searchInput.value : "";
      this.filterLeads(query);
    }
  }

  hideDropdown() {
    const dropdown = document.getElementById("lead-dropdown");
    if (dropdown) {
      dropdown.classList.add("hidden");
      this.isOpen = false;
    }
  }

  toggleDropdown() {
    if (this.isOpen) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  // Set a lead as selected (useful for edit mode)
  setSelectedLead(leadId) {
    const lead = this.leads.find((l) => l.lead_id === leadId);
    if (lead) {
      this.selectedLead = lead;
      this.showSelectedDisplay(lead);
      this.updateFormFields(lead);
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

export function initializeLeadSelect(dbWorker) {
  document.addEventListener("click", (e) => {
    // Initialize lead select when deal modal opens
    if (e.target.closest("#open-modal-btn") || e.target.closest("#editDeal")) {
      const currentTab = sessionStorage.getItem("currentTab");

      if (currentTab === "/deals") {
        setTimeout(() => {
          const leadIdField = document.getElementById("lead_id");
          if (leadIdField && !document.getElementById("lead-select-container")) {
            const container = leadIdField.closest("div");
            if (container) {
              container.id = "lead-select-container";
              const leadSelect = new LeadSelect("lead-select-container", dbWorker);
              leadSelect.initialize();
            }
          }
        }, 150);
      }
    }
  });
}
