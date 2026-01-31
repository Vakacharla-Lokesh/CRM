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
    const user = JSON.parse(localStorage.getItem("user"));
    console.log(user);
    return new Promise((resolve) => {
      const handler = (e) => {
        const { action, rows, storeName } = e.data;

        if (action === "getAllSuccess" && storeName === "Organizations") {
          console.log("Inside organization select: ");
          this.dbWorker.removeEventListener("message", handler);
          this.organizations = rows || [];
          resolve();
        }
      };

      this.dbWorker.addEventListener("message", handler);
      this.dbWorker.postMessage({
        action: "getAllOrganizations",
        storeName: "Organizations",
        user_id: user.user_id,
        tenant_id: user.tenant_id,
        role: user.role,
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
          Organization <span class="text-xs text-gray-500">(Optional)</span>
        </label>
        
        <div class="relative">
          <input
            type="text"
            id="org-search-input"
            placeholder="Search existing organizations..."
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
    const clearBtn = document.getElementById("org-clear-btn");

    if (searchInput) {
      searchInput.addEventListener("focus", () => {
        this.showDropdown();
      });

      searchInput.addEventListener("blur", () => {
        this.hideDropdown();
      });

      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        this.filterOrganizations(query);

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

  filterOrganizations(query) {
    const orgList = document.getElementById("org-list");
    if (!orgList) return;

    const filtered = this.organizations.filter((org) =>
      org.organization_name.toLowerCase().includes(query),
    );

    if (filtered.length === 0) {
      orgList.innerHTML = `
        <div class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
          No matching organizations found
        </div>
      `;
    } else {
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
    }

    orgList.querySelectorAll("[data-org-id]").forEach((item) => {
      item.addEventListener("click", (e) => {
        const orgId = e.currentTarget.getAttribute("data-org-id");
        this.selectOrganization(orgId);
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

  updateFormFields(org) {
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

    const form = document.querySelector('form[data-form="createLead"]');
    if (!form) return;

    let hiddenOrgIdField = document.getElementById("selected_organization_id");
    if (!hiddenOrgIdField) {
      hiddenOrgIdField = document.createElement("input");
      hiddenOrgIdField.type = "hidden";
      hiddenOrgIdField.id = "selected_organization_id";
      hiddenOrgIdField.name = "selected_organization_id";
      form.appendChild(hiddenOrgIdField);
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
    }

    if (searchInput) {
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
    const searchInput = document.getElementById("org-search-input");
    if (searchInput) {
      searchInput.value = "";
    }
    this.hideSelectedDisplay();

    // Clear form fields only if they exist
    const fieldIds = [
      "organization_name",
      "organization_website_name",
      "organization_size",
    ];

    fieldIds.forEach((id) => {
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
      const searchInput = document.getElementById("org-search-input");
      const query = searchInput ? searchInput.value : "";
      this.filterOrganizations(query);
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

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

export function initializeOrgSelect(dbWorker) {
  document.addEventListener("click", (e) => {
    if (e.target.closest("#open-modal-btn")) {
      const currentTab = sessionStorage.getItem("currentTab");

      if (currentTab === "/leads") {
        setTimeout(() => {
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

    if (e.target.closest("#editDeal")) {
      const currentTab = sessionStorage.getItem("currentTab");
      if (currentTab === "/deals") {
        console.log("Inside orgselect editDeal: ");
        setTimeout(() => {
          const orgNameField = document.getElementById("organization_id");
          if (
            orgNameField &&
            !document.getElementById("org-select-container")
          ) {
            const container = document.getElementById("organization-select");
            if (container) {
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
