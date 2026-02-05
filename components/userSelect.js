import userManager from "../events/handlers/userManager.js";

export class UserSelect {
  constructor(containerId, dbWorker) {
    this.containerId = containerId;
    this.dbWorker = dbWorker;
    this.users = [];
    this.selectedUser = null;
    this.isOpen = false;
  }

  async initialize() {
    await this.loadUsers();
    this.render();
    this.attachEventListeners();
  }

  loadUsers() {
    const user = userManager.getUser();
    console.log(user);
    if (!user) {
      console.warn("No users available to load.");
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const handler = (e) => {
        const { action, rows, storeName } = e.data;

        if (action === "getAllSuccess" && storeName === "Users") {
          this.dbWorker.removeEventListener("message", handler);
          this.users = rows || [];
          resolve();
        }
      };

      this.dbWorker.addEventListener("message", handler);
      this.dbWorker.postMessage({
        action: "getAllUsers",
        storeName: "Users",
        user_id: user.user_id,
        tenant_id: user.tenant_id || null,
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
          User <span class="text-xs text-gray-500">(Optional)</span>
        </label>
        
        <div class="relative">
          <input
            type="text"
            id="user-search-input"
            placeholder="Search existing users..."
            autocomplete="off"
            class="w-full px-3 py-2 pr-10 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          
          <button type="button" id="user-dropdown-btn" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>

        <div id="user-dropdown" class="hidden absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div id="user-list" class="py-1"></div>
        </div>

        <div id="user-selected-display" class="hidden mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-900 dark:text-blue-100" id="user-display-name"></p>
              <p class="text-xs text-blue-700 dark:text-blue-300" id="user-display-details"></p>
            </div>
            <button type="button" id="user-clear-btn" class="text-blue-600 dark:text-blue-400 hover:text-blue-800">
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
    const searchInput = document.getElementById("user-search-input");
    const dropdownBtn = document.getElementById("user-dropdown-btn");
    const clearBtn = document.getElementById("user-clear-btn");

    if (searchInput) {
      searchInput.addEventListener("focus", () => {
        this.showDropdown();
      });

      searchInput.addEventListener("blur", () => {
        setTimeout(() => this.hideDropdown(), 100);
      });

      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        this.filterUsers(query);

        if (query && !this.isOpen) {
          this.showDropdown();
        }
      });
    }

    if (dropdownBtn) {
      dropdownBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearSelection();
      });
    }

    document.addEventListener("click", (e) => {
      if (!e.target.closest(`#${this.containerId}`)) {
        this.hideDropdown();
      }
    });
  }

  filterUsers(query) {
    const userList = document.getElementById("user-list");
    if (!userList) return;

    console.log("Inside super_admin: ", this.users);

    const filtered = this.users.filter(
      (user) =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query),
    );

    if (filtered.length === 0) {
      userList.innerHTML = `
        <div class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
          No matching users found
        </div>
      `;
    } else {
      userList.innerHTML = filtered
        .map(
          (user) => `
        <div class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0" data-user-id="${user.user_id}">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">${this.escapeHtml(user.first_name + " " + user.last_name)}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">${this.escapeHtml(user.user_email || "")}</p>
        </div>
      `,
        )
        .join("");
    }

    userList.querySelectorAll("[data-user-id]").forEach((item) => {
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const userId = e.currentTarget.getAttribute("data-user-id");
        this.selectUser(userId);
      });
    });
  }

  selectUser(userId) {
    const user = this.users.find((u) => u.user_id === userId);
    if (!user) return;

    this.selectedUser = user;
    this.updateFormFields(user);
    this.showSelectedDisplay(user);
    this.hideDropdown();
  }

  updateFormFields(user) {
    const form = document.querySelector('form[data-form="createLead"]');
    if (!form) return;

    let hiddenUserIdField = document.getElementById("assigned_user_id");
    if (!hiddenUserIdField) {
      hiddenUserIdField = document.createElement("input");
      hiddenUserIdField.type = "hidden";
      hiddenUserIdField.id = "assigned_user_id";
      hiddenUserIdField.name = "assigned_user_id";
      form.appendChild(hiddenUserIdField);
    }
    hiddenUserIdField.value = user.user_id;
  }

  showSelectedDisplay(user) {
    const display = document.getElementById("user-selected-display");
    const nameEl = document.getElementById("user-display-name");
    const detailsEl = document.getElementById("user-display-details");
    const searchInput = document.getElementById("user-search-input");

    if (display && nameEl && detailsEl) {
      nameEl.textContent = user.user_name;
      detailsEl.textContent = user.email || "No email provided";
      display.classList.remove("hidden");
    }

    if (searchInput) {
      searchInput.value = user.user_name;
    }
  }

  hideSelectedDisplay() {
    const display = document.getElementById("user-selected-display");
    if (display) {
      display.classList.add("hidden");
    }
  }

  clearSelection() {
    this.selectedUser = null;
    const searchInput = document.getElementById("user-search-input");
    if (searchInput) {
      searchInput.value = "";
    }
    this.hideSelectedDisplay();

    const hiddenUserIdField = document.getElementById("assigned_user_id");
    if (hiddenUserIdField) {
      hiddenUserIdField.remove();
    }
  }

  showDropdown() {
    const dropdown = document.getElementById("user-dropdown");
    if (dropdown) {
      dropdown.classList.remove("hidden");
      this.isOpen = true;
      const searchInput = document.getElementById("user-search-input");
      const query = searchInput ? searchInput.value : "";
      this.filterUsers(query);
    }
  }

  hideDropdown() {
    const dropdown = document.getElementById("user-dropdown");
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

export function initializeUserSelect(dbWorker) {
  document.addEventListener("click", (e) => {
    if (e.target.closest("#open-modal-btn")) {
      const currentTab = sessionStorage.getItem("currentTab");

      if (currentTab === "/leads") {
        setTimeout(() => {
          const user = userManager.getUser();
          const userAssignmentSection = document.getElementById(
            "user-assignment-section",
          );

          if (
            user &&
            (user.role === "admin" || user.role === "super_admin") &&
            userAssignmentSection
          ) {
            userAssignmentSection.classList.remove("hidden");

            const userSelectContainer = document.getElementById(
              "user-select-container",
            );
            if (
              userSelectContainer &&
              !userSelectContainer.hasAttribute("data-initialized")
            ) {
              userSelectContainer.setAttribute("data-initialized", "true");
              const userSelect = new UserSelect(
                "user-select-container",
                dbWorker,
              );
              userSelect.initialize();
            }
          } else if (userAssignmentSection) {
            userAssignmentSection.classList.add("hidden");
          }
        }, 150);
      }
    }
  });
}
