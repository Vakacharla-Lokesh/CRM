import userManager from "../../events/handlers/userManager.js";

const template = document.createElement("template");
template.innerHTML = `<div
  id="form-modal"
  class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto"
>
  <div class="relative w-full max-w-xl p-4">
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div
        class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4"
      >
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Add User
        </h3>
        <button
          id="close-modal-btn"
          class="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm w-9 h-9 flex items-center justify-center"
        >
          <svg
            class="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span class="sr-only">Close modal</span>
        </button>
      </div>

      <form
        class="pt-4"
        data-form="createUser"
      >
        <!-- Tenant Selection (visible only for super_admin) -->
        <div class="mb-4 col-span-2" id="tenant-selection-wrapper" style="display: none;">
          <label
            for="user_tenant"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Select Tenant <span class="text-red-500">*</span></label
          >
          <select
            id="user_tenant"
            class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
          >
            <option value="">-- Select a Tenant --</option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Choose which tenant this user will belong to
          </p>
        </div>

        <div
          class="grid grid-cols-2 gap-4 border-b border-gray-200 dark:border-gray-700 pb-4"
        >
          <div class="mb-4">
            <label
              for="user_name"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >User Name <span class="text-red-500">*</span></label
            >
            <input
              type="text"
              id="user_name"
              placeholder="User Name"
              required
              class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div class="mb-4">
            <label
              for="user_email"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Email Id <span class="text-red-500">*</span></label
            >
            <input
              type="email"
              id="user_email"
              placeholder="hello@gmail.com"
              required
              class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div class="mb-4">
            <label
              for="user_mobile"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Mobile Number</label
            >
            <input
              type="text"
              id="user_mobile"
              placeholder="1234567890"
              class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div class="mb-4">
            <label
              for="user_password"
              class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password <span class="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="user_password"
              placeholder="••••••••"
              required
              class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <!-- Role Selection (visible only for super_admin) -->
          <div class="mb-4" id="role-selection-wrapper" style="display: none;">
            <label
              for="user_role"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Role</label
            >
            <select
              id="user_role"
              class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          class="w-full mb-3 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none shadow"
        >
          Add User
        </button>
      </form>
    </div>
  </div>
</div>`;

class UserModal extends HTMLElement {
  constructor() {
    super();
    this.tenants = [];
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }

    this.render();
    this.setupEventListeners();
  }

  async render() {
    console.log("User Modal rendered");
    const currentUser = userManager.getUser();
    if (currentUser && currentUser.role === "super_admin") {
      const tenantWrapper = this.querySelector("#tenant-selection-wrapper");
      const roleWrapper = this.querySelector("#role-selection-wrapper");

      if (tenantWrapper) tenantWrapper.style.display = "block";
      if (roleWrapper) roleWrapper.style.display = "block";

      await this.loadTenantsIfSuperAdmin();
    }
  }

  async loadTenantsIfSuperAdmin() {
    const currentUser = userManager.getUser();

    if (!currentUser || currentUser.role !== "super_admin") {
      return;
    }

    const dbWorker = window.dbWorker;
    if (!dbWorker) {
      console.warn("Database worker not available");
      return;
    }

    return new Promise((resolve) => {
      const messageHandler = (e) => {
        const { action, rows, storeName } = e.data;

        if (action === "getAllSuccess" && storeName === "Tenants") {
          dbWorker.removeEventListener("message", messageHandler);
          this.tenants = rows || [];
          this.populateTenantDropdown();
          resolve();
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "getAllTenants",
        storeName: "Tenants",
      });
      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        resolve();
      }, 5000);
    });
  }

  populateTenantDropdown() {
    const tenantSelect = this.querySelector("#user_tenant");
    if (!tenantSelect) return;

    tenantSelect.innerHTML = '<option value="">Select a Tenant</option>';
    this.tenants.forEach((tenant) => {
      const option = document.createElement("option");
      option.value = tenant.tenant_id;
      option.textContent = tenant.tenant_name || "Unnamed Tenant";
      tenantSelect.appendChild(option);
    });

    console.log(
      `Populated tenant dropdown with ${this.tenants.length} tenants`,
    );
  }

  setupEventListeners() {
    const closeBtn = this.querySelector("#close-modal-btn");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const modal = this.querySelector("#form-modal");
        if (modal) {
          modal.classList.add("hidden");
        }
        this.resetForm();
      });
    }
  }

  resetForm() {
    const form = this.querySelector('form[data-form="createUser"]');
    if (form) {
      form.reset();
    }
  }
}

customElements.define("user-modal", UserModal);
