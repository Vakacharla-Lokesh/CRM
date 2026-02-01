import { eventBus, EVENTS } from "../events/eventBus.js";

const template = document.createElement("template");
template.innerHTML = `<div
  id="tenant-modal"
  class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto"
>
  <div class="relative w-full max-w-2xl p-4 mx-4">
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Create New Tenant
        </h3>
        <button
          id="close-tenant-modal-btn"
          type="button"
          class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <form
        class="px-6 py-4"
        data-form="createTenant"
      >
        <!-- Tenant Information -->
        <div class="mb-4">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-3">
            Tenant Information
          </h4>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label
                for="tenant_name"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tenant Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="tenant_name"
                name="tenant_name"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Acme Corporation"
              />
            </div>
          </div>
        </div>

        <!-- Admin Information -->
        <div class="mb-4">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-3">
            Admin User Information
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="admin_first_name"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="admin_first_name"
                name="admin_first_name"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label
                for="admin_last_name"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="admin_last_name"
                name="admin_last_name"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Doe"
              />
            </div>
            <div>
              <label
                for="admin_email"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="admin_email"
                name="admin_email"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label
                for="admin_mobile"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                id="admin_mobile"
                name="admin_mobile"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label
                for="admin_password"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password <span class="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="admin_password"
                name="admin_password"
                required
                minlength="6"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label
                for="admin_confirm_password"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password <span class="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="admin_confirm_password"
                name="admin_confirm_password"
                required
                minlength="6"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Confirm password"
              />
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <button
            type="button"
            id="cancel-tenant-btn"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="submit-tenant-btn"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors"
          >
            Create Tenant
          </button>
        </div>
      </form>
    </div>
  </div>
</div>`;

class TenantModal extends HTMLElement {
  constructor() {
    super();
    this.isEditMode = false;
    this.currentTenantId = null;
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }

    this.modal = this.querySelector("#tenant-modal");
    this.form = this.querySelector('form[data-form="createTenant"]');
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close modal buttons
    const closeBtn = this.querySelector("#close-tenant-modal-btn");
    const cancelBtn = this.querySelector("#cancel-tenant-btn");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.close());
    }

    // Close modal on outside click
    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Form submit handler
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  open(tenantData = null) {
    if (tenantData) {
      this.isEditMode = true;
      this.currentTenantId = tenantData.tenant_id;
      this.populateForm(tenantData);
      
      // Update modal title and button
      const title = this.querySelector("h3");
      const submitBtn = this.querySelector("#submit-tenant-btn");
      if (title) title.textContent = "Edit Tenant";
      if (submitBtn) submitBtn.textContent = "Update Tenant";

      // Hide admin fields in edit mode
      const adminSection = this.querySelector(".mb-4:last-of-type");
      if (adminSection) adminSection.style.display = "none";
    } else {
      this.isEditMode = false;
      this.currentTenantId = null;
      this.form?.reset();
      
      // Reset modal title and button
      const title = this.querySelector("h3");
      const submitBtn = this.querySelector("#submit-tenant-btn");
      if (title) title.textContent = "Create New Tenant";
      if (submitBtn) submitBtn.textContent = "Create Tenant";

      // Show admin fields in create mode
      const adminSection = this.querySelector(".mb-4:last-of-type");
      if (adminSection) adminSection.style.display = "block";
    }

    this.modal?.classList.remove("hidden");
  }

  close() {
    this.modal?.classList.add("hidden");
    this.form?.reset();
    this.isEditMode = false;
    this.currentTenantId = null;
  }

  populateForm(data) {
    const tenantNameInput = this.querySelector("#tenant_name");
    if (tenantNameInput) tenantNameInput.value = data.tenant_name || "";
  }

  handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const tenantName = formData.get("tenant_name");
    
    if (this.isEditMode) {
      // Handle update
      eventBus.emit(EVENTS.TENANT_UPDATE, {
        tenantData: {
          tenant_id: this.currentTenantId,
          tenant_name: tenantName,
          updated_at: new Date().toISOString(),
        },
      });
    } else {
      const password = formData.get("admin_password");
      const confirmPassword = formData.get("admin_confirm_password");
      
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      eventBus.emit(EVENTS.TENANT_CREATE, {
        tenantData: {
          tenant_name: tenantName,
          admin_first_name: formData.get("admin_first_name"),
          admin_last_name: formData.get("admin_last_name"),
          admin_email: formData.get("admin_email"),
          admin_mobile: formData.get("admin_mobile"),
          admin_password: password,
        },
      });
    }

    this.close();
  }
}

customElements.define("tenant-modal", TenantModal);
