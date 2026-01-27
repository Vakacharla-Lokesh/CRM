// components/organizationSelect.js

export class OrganizationSelect {
  constructor(containerId, dbWorker) {
    this.containerId = containerId;
    this.dbWorker = dbWorker;
    this.organizations = [];
    this.selectedOrg = null;
    this.isOpen = false;
  }

  async initialize() {
    await this.loadOrganizations();
    this.render();
    this.attachEventListeners();
  }

  loadOrganizations() {
    return new Promise((resolve) => {
      const handler = (e) => {
        const { action, rows, storeName } = e.data;

        if (action === "getAllSuccess" && storeName === "Organizations") {
          this.dbWorker.removeEventListener("message", handler);
          this.organizations = rows || [];
          resolve();
        }
      };

      this.dbWorker.addEventListener("message", handler);
      this.dbWorker.postMessage({
        action: "getAllOrganizations",
        storeName: "Organizations",
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
          Organization <span class="text-xs text-gray-500">(Select or create new)</span>
        </label>
        
        <div class="relative">
          <input
            type="text"
            id="org-search-input"
            placeholder="Search or type to create new..."
            autocomplete="off"
            class="w-full px-3 py-2 pr-10 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          
          <button type="button" id="org-dropdown-btn" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>

        <!-- Dropdown Menu -->
        <div id="org-dropdown" class="hidden absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div id="org-list" class="py-1"></div>
        </div>

        <!-- Selected Organization Display -->
        <div id="org-selected-display" class="hidden mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-900 dark:text-blue-100" id="org-display-name"></p>
              <p class="text-xs text-blue-700 dark:text-blue-300" id="org-display-details"></p>
            </div>
            <button type="button" id="org-clear-btn" class="text-blue-600 dark:text-blue-400 hover:text-blue-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const searchInput = document.getElementById("org-search-input");
    const dropdownBtn = document.getElementById("org-dropdown-btn");
    const dropdown = document.getElementById("org-dropdown");
    const clearBtn = document.getElementById("org-clear-btn");

    // Show/hide dropdown
    searchInput.addEventListener("focus", () => {
      this.showDropdown();
    });

    dropdownBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleDropdown();
    });

    // Search/filter
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      this.filterOrganizations(query);

      if (query && !this.isOpen) {
        this.showDropdown();
      }
    });

    // Clear selection
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

  filterOrganizations(query) {
    const orgList = document.getElementById("org-list");
    if (!orgList) return;

    const filtered = this.organizations.filter((org) =>
      org.organization_name.toLowerCase().includes(query),
    );

    if (filtered.length === 0 && query) {
      // Show "Create new" option
      orgList.innerHTML = `
        <div class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20" data-create-new="${query}">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="text-green-700 dark:text-green-300">Create "<strong>${this.escapeHtml(query)}</strong>"</span>
          </div>
        </div>
      `;
    } else {
      // Show filtered organizations
      orgList.innerHTML = filtered
        .map(
          (org) => `
        <div class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0" data-org-id="${org.organization_id}">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">${this.escapeHtml(org.organization_name)}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            ${org.organization_size ? `${org.organization_size} employees` : ""} 
            ${org.organization_industry ? `• ${org.organization_industry}` : ""}
          </p>
        </div>
      `,
        )
        .join("");

      // Add "Create new" option if query doesn't match exactly
      if (
        query &&
        !filtered.some((org) => org.organization_name.toLowerCase() === query)
      ) {
        orgList.innerHTML += `
          <div class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20" data-create-new="${query}">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="text-green-700 dark:text-green-300">Create "<strong>${this.escapeHtml(query)}</strong>"</span>
            </div>
          </div>
        `;
      }
    }

    // Attach click handlers
    orgList.querySelectorAll("[data-org-id]").forEach((item) => {
      item.addEventListener("click", (e) => {
        const orgId = e.currentTarget.getAttribute("data-org-id");
        this.selectOrganization(orgId);
      });
    });

    orgList.querySelectorAll("[data-create-new]").forEach((item) => {
      item.addEventListener("click", (e) => {
        const orgName = e.currentTarget.getAttribute("data-create-new");
        this.createNewOrganization(orgName);
      });
    });
  }

  selectOrganization(orgId) {
    const org = this.organizations.find((o) => o.organization_id === orgId);
    if (!org) return;

    this.selectedOrg = org;
    this.updateFormFields(org);
    this.showSelectedDisplay(org);
    this.hideDropdown();
  }

  createNewOrganization(orgName) {
    // Clear form and set organization name
    document.getElementById("organization_name").value = orgName;
    document.getElementById("organization_website_name").value = "";
    document.getElementById("organization_size").value = "";
    document.getElementById("organization_industry").value = "Software";

    // Clear the search input
    document.getElementById("org-search-input").value = orgName;

    this.selectedOrg = null;
    this.hideDropdown();
    this.hideSelectedDisplay();

    // Remove the hidden organization_id field (we're creating new)
    const hiddenOrgIdField = document.getElementById(
      "selected_organization_id",
    );
    if (hiddenOrgIdField) {
      hiddenOrgIdField.remove();
    }

    // Show notification
    this.showNotification(`Creating new organization: ${orgName}`, "info");
  }

  updateFormFields(org) {
    // Auto-fill organization fields
    const fields = {
      organization_name: org.organization_name,
      organization_website_name: org.organization_website_name || "",
      organization_size: org.organization_size || "",
      organization_industry: org.organization_industry || "Software",
    };

    Object.keys(fields).forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = fields[fieldId];
        field.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    // Store the organization_id in a hidden field
    let hiddenOrgIdField = document.getElementById("selected_organization_id");
    if (!hiddenOrgIdField) {
      hiddenOrgIdField = document.createElement("input");
      hiddenOrgIdField.type = "hidden";
      hiddenOrgIdField.id = "selected_organization_id";
      hiddenOrgIdField.name = "selected_organization_id";
      document
        .querySelector('form[data-form="createLead"]')
        .appendChild(hiddenOrgIdField);
    }
    hiddenOrgIdField.value = org.organization_id;
  }

  showSelectedDisplay(org) {
    const display = document.getElementById("org-selected-display");
    const nameEl = document.getElementById("org-display-name");
    const detailsEl = document.getElementById("org-display-details");
    const searchInput = document.getElementById("org-search-input");

    if (display && nameEl && detailsEl) {
      nameEl.textContent = org.organization_name;
      detailsEl.textContent = `${org.organization_size || "N/A"} employees • ${org.organization_industry || "N/A"}`;
      display.classList.remove("hidden");
      searchInput.value = org.organization_name;
    }
  }

  hideSelectedDisplay() {
    const display = document.getElementById("org-selected-display");
    if (display) {
      display.classList.add("hidden");
    }
  }

  clearSelection() {
    this.selectedOrg = null;
    document.getElementById("org-search-input").value = "";
    this.hideSelectedDisplay();

    // Clear form fields
    [
      "organization_name",
      "organization_website_name",
      "organization_size",
    ].forEach((id) => {
      const field = document.getElementById(id);
      if (field) field.value = "";
    });

    // Remove the hidden organization_id field
    const hiddenOrgIdField = document.getElementById(
      "selected_organization_id",
    );
    if (hiddenOrgIdField) {
      hiddenOrgIdField.remove();
    }
  }

  showDropdown() {
    const dropdown = document.getElementById("org-dropdown");
    if (dropdown) {
      dropdown.classList.remove("hidden");
      this.isOpen = true;
      this.filterOrganizations(
        document.getElementById("org-search-input").value,
      );
    }
  }

  hideDropdown() {
    const dropdown = document.getElementById("org-dropdown");
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

  showNotification(message, type) {
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

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the organization select when lead modal opens
export function initializeOrgSelect(dbWorker) {
  document.addEventListener("click", (e) => {
    if (e.target.closest("#open-modal-btn")) {
      const currentTab = sessionStorage.getItem("currentTab");

      if (currentTab === "/leads") {
        setTimeout(() => {
          // Replace the organization name field with our custom select
          const orgNameField = document.getElementById("organization_name");
          if (
            orgNameField &&
            !document.getElementById("org-select-container")
          ) {
            const container = orgNameField
              .closest(".grid")
              .querySelector("div:first-child");
            if (container) {
              container.id = "org-select-container";
              const orgSelect = new OrganizationSelect(
                "org-select-container",
                dbWorker,
              );
              orgSelect.initialize();
            }
          }
        }, 150);
      }
    }
  });
}
