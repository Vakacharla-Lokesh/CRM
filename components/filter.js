class Filter extends HTMLElement {
  constructor() {
    super();
    this.statusSet = new Set();
    this.statusLeadsMap = new Map();
    this.allLeads = [];
    this.selectedStatus = null;
    this.tableBodyId = "leads-body";
    this.isInitialized = false;
  }

  connectedCallback() {
    if (!this.isInitialized) {
      this.innerHTML = `
        <div class="smart-filter-container mb-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Status:
            </label>
            <select 
              class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled
            >
              <option>Loading...</option>
            </select>
          </div>
        </div>
      `;
    }
  }

  initialize(leads = []) {
    this.allLeads = leads;
    this.isInitialized = true;
    this.buildStatusStructures();
    this.render();
    this.attachEventListeners();
  }

  buildStatusStructures() {
    this.statusSet.clear();
    this.statusLeadsMap.clear();
    this.allLeads.forEach((lead) => {
      const status = lead.lead_status || "New";
      this.statusSet.add(status);
      if (!this.statusLeadsMap.has(status)) {
        this.statusLeadsMap.set(status, new Set());
      }
      const leadId = String(lead.lead_id);
      this.statusLeadsMap.get(status).add(leadId);
    });
  }
  render() {
    const statusArray = Array.from(this.statusSet).sort();

    const html = `
      <div class="smart-filter-container mb-4">
        <div class="flex items-center gap-2">
          <label for="status-filter" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Status:
          </label>
          
          <select 
            id="status-filter"
            class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-colors"
          >
            <option value="">All Leads (${this.allLeads.length})</option>
            ${statusArray
              .map((status) => {
                const count = this.statusLeadsMap.get(status).size;
                return `<option value="${status}">${status} (${count})</option>`;
              })
              .join("")}
          </select>

          <button 
            id="clear-filter-btn"
            class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 
                   text-gray-700 dark:text-gray-300 rounded-lg
                   hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Clear filter"
          >
            Clear
          </button>
        </div>
      </div>
    `;

    this.innerHTML = html;
  }

  attachEventListeners() {
    const filterSelect = this.querySelector("#status-filter");
    const clearBtn = this.querySelector("#clear-filter-btn");

    filterSelect.addEventListener("change", (e) => {
      this.selectedStatus = e.target.value || null;
      this.applyFilter();
    });

    clearBtn.addEventListener("click", () => {
      filterSelect.value = "";
      this.selectedStatus = null;
      this.applyFilter();
    });
  }
  applyFilter() {
    const tableBody = document.getElementById(this.tableBodyId);
    if (!tableBody) {
      console.warn(`Table body with ID "${this.tableBodyId}" not found`);
      return;
    }

    const rows = tableBody.querySelectorAll("tr");
    let visibleCount = 0;

    if (!this.selectedStatus) {
      rows.forEach((row) => {
        row.style.display = "";
        if (!row.querySelector("td[colspan]")) {
          visibleCount++;
        }
      });
      this.updateFilterInfo(`Showing all ${this.allLeads.length} leads`);
    } else {
      const filteredLeadIds = this.statusLeadsMap.get(this.selectedStatus);

      console.log(`Filtering by status: ${this.selectedStatus}`);
      console.log(`Filtered lead IDs:`, Array.from(filteredLeadIds));

      rows.forEach((row) => {
        const leadId = row.getAttribute("data-lead-id");

        if (leadId && filteredLeadIds.has(leadId)) {
          row.style.display = "";
          visibleCount++;
        } else {
          row.style.display = "none";
        }
      });

      console.log(`Visible rows after filter: ${visibleCount}`);
    }
    this.handleEmptyState(tableBody, visibleCount);
  }

  handleEmptyState(tableBody, visibleCount) {
    let emptyRow = tableBody.querySelector(".filter-empty-state");

    if (visibleCount === 0 && this.selectedStatus) {
      if (!emptyRow) {
        const colCount = document.querySelector(
          "#leads-table thead tr",
        ).childElementCount;
        emptyRow = document.createElement("tr");
        emptyRow.className = "filter-empty-state";
        emptyRow.innerHTML = `
          <td colspan="${colCount}" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm font-medium">No leads found with status "${this.selectedStatus}"</p>
          </td>
        `;
        tableBody.appendChild(emptyRow);
      }
    } else if (emptyRow) {
      emptyRow.remove();
    }
  }

  getStatistics() {
    const stats = {};
    this.statusSet.forEach((status) => {
      stats[status] = this.statusLeadsMap.get(status).size;
    });
    return {
      totalLeads: this.allLeads.length,
      uniqueStatuses: this.statusSet.size,
      statusDistribution: stats,
    };
  }

  updateLeads(newLeads) {
    this.allLeads = newLeads;
    this.buildStatusStructures();
    this.render();
    this.attachEventListeners();
    if (this.selectedStatus) {
      this.applyFilter();
    }
  }

  logFilterData() {
    console.log("=== Smart Filter Data ===");
    console.log("Status Set:", this.statusSet);
    console.log("Status-Leads Map:", this.statusLeadsMap);
    console.log("Statistics:", this.getStatistics());
  }
}

customElements.define("smart-filter", Filter);

export { Filter };
