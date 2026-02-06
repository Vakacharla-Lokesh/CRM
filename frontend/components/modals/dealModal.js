import userManager from "../../events/handlers/userManager.js";

const template = document.createElement("template");
template.innerHTML = `<div
  id="deal-form-modal"
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
        <h3 id="deal-modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
          Edit Deal
        </h3>
        <button
          id="close-deal-modal-btn"
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
        data-form="createDeal"
        id="deal-form"
      >
        <input type="hidden" id="deal_id_hidden" name="deal_id" value="">
        
        <!-- Deal Information -->
        <div class="mb-6">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-3">
            Deal Information
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="deal_name"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Deal Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="deal_name"
                name="deal_name"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Q1 Software Deal"
              />
            </div>
            <div>
              <label
                for="deal_value"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Deal Value ($) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="deal_value"
                name="deal_value"
                min="1"
                max="1000000"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="50000"
              />
            </div>
            <div>
              <label
                for="lead_id"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Associated Lead <span class="text-red-500">*</span>
              </label>
              <select
                id="lead_id"
                name="lead_id"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Loading leads...</option>
              </select>
            </div>
            <div id="organization-select">
              <label
                for="organization_id"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Organization
              </label>
              <select
                id="organization_id"
                name="organization_id"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Loading organizations...</option>
              </select>
            </div>
            <div>
              <label
                for="deal_status"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Deal Status <span class="text-red-500">*</span>
              </label>
              <select
                id="deal_status"
                name="deal_status"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Prospecting">Prospecting</option>
                <option value="Qualification">Qualification</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Ready to close">Ready to close</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex gap-3">
          <button
            type="submit"
            id="deal-submit-btn"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
          >
            Update Deal
          </button>
          <button
            type="button"
            id="cancel-deal-btn"
            class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</div>`;

class DealModal extends HTMLElement {
  constructor() {
    super();
    this.editMode = false;
    this.currentDealData = null;
    this.leads = [];
    this.organizations = [];
    this.dbWorker = null;
    this.messageHandler = null;
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }
    this.dbWorker = window.dbWorker;
    this.render();
    this.setupListeners();
    this.setupDbWorkerListener();
    this.loadDropdownData();
  }

  setupDbWorkerListener() {
    if (!this.dbWorker) {
      console.error("DB Worker not available");
      return;
    }

    this.messageHandler = (e) => {
      const { action, data, rows, storeName } = e.data;

      console.log("DealModal received:", {
        action,
        storeName,
        dataLength: data?.length || rows?.length,
      });

      if (action === "getAllSuccess" && storeName === "Leads") {
        const leadsData = data || rows || [];
        this.leads = leadsData;
        this.populateLeadDropdown();

        if (this.currentDealData && this.currentDealData.lead_id) {
          this.selectLeadInDropdown(this.currentDealData.lead_id);
        }
      }

      if (action === "getAllSuccess" && storeName === "Organizations") {
        const orgsData = data || rows || [];
        this.organizations = orgsData;
        this.populateOrganizationDropdown();

        if (this.currentDealData && this.currentDealData.organization_id) {
          this.selectOrganizationInDropdown(
            this.currentDealData.organization_id,
          );
        }
      }

      if (action === "getByIdSuccess" && data && data.deal_id) {
        this.setEditMode(data);
      }
    };

    this.dbWorker.addEventListener("message", this.messageHandler);
  }

  setupListeners() {
    const cancelBtn = this.querySelector("#cancel-deal-btn");
    const closeBtn = this.querySelector("#close-deal-modal-btn");

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.closeModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.closeModal();
      });
    }
  }

  setEditMode(dealData) {
    console.log("Setting edit mode with deal data:", dealData);

    this.editMode = true;
    this.currentDealData = dealData;

    const modalTitle = this.querySelector("#deal-modal-title");
    const submitBtn = this.querySelector("#deal-submit-btn");

    if (modalTitle) modalTitle.textContent = "Edit Deal";
    if (submitBtn) submitBtn.textContent = "Update Deal";

    setTimeout(() => {
      this.populateForm(dealData);
    }, 150);
  }

  populateForm(data) {
    if (!data) return;
    console.log("Populating form with:", data);

    const fields = {
      deal_id_hidden: data.deal_id || "",
      deal_name: data.deal_name || "",
      deal_value: data.deal_value || "",
      deal_status: data.deal_status || "Prospecting",
    };

    Object.keys(fields).forEach((fieldId) => {
      const field = this.querySelector(`#${fieldId}`);
      if (field) {
        field.value = fields[fieldId];
      }
    });

    if (data.lead_id) {
      this.selectLeadInDropdown(data.lead_id);
    }

    if (data.organization_id) {
      this.selectOrganizationInDropdown(data.organization_id);
    }
  }

  selectLeadInDropdown(leadId) {
    const leadSelect = this.querySelector("#lead_id");
    if (!leadSelect) {
      console.warn("Lead select element not found");
      return;
    }

    leadSelect.value = leadId;

    if (leadSelect.value !== leadId) {
      console.log("Lead not yet available, retrying in 300ms...");
      setTimeout(() => {
        leadSelect.value = leadId;
        console.log("Lead selected:", leadId);
      }, 300);
    } else {
      console.log("Lead selected immediately:", leadId);
    }
  }

  selectOrganizationInDropdown(organizationId) {
    const orgSelect = this.querySelector("#organization_id");
    if (!orgSelect) {
      console.warn("Organization select element not found");
      return;
    }
    orgSelect.value = organizationId;
    if (orgSelect.value !== organizationId) {
      console.log("Organization not yet available, retrying in 300ms...");
      setTimeout(() => {
        orgSelect.value = organizationId;
        console.log("Organization selected:", organizationId);
      }, 300);
    } else {
      console.log("Organization selected immediately:", organizationId);
    }
  }

  closeModal() {
    const modal = this.querySelector("#deal-form-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
    const form = this.querySelector("#deal-form");
    if (form) form.reset();
    this.setCreateMode();
  }

  setCreateMode() {
    this.editMode = false;
    this.currentDealData = null;

    const modalTitle = this.querySelector("#deal-modal-title");
    const submitBtn = this.querySelector("#deal-submit-btn");
    const form = this.querySelector("#deal-form");

    if (modalTitle) modalTitle.textContent = "Edit Deal";
    if (submitBtn) submitBtn.textContent = "Update Deal";
    if (form) form.reset();

    const dealIdField = this.querySelector("#deal_id_hidden");
    if (dealIdField) dealIdField.value = "";
  }

  loadDropdownData() {
    if (!this.dbWorker) return;
    const user = userManager.getUser();
    console.log("Loading dropdown data...");
    this.dbWorker.postMessage({
      action: "getAllLeads",
      storeName: "Leads",
      user_id: user?.user_id,
      tenant_id: user?.tenant_id,
      role: user?.role,
    });
    this.dbWorker.postMessage({
      action: "getAllOrganizations",
      storeName: "Organizations",
      user_id: user?.user_id,
      tenant_id: user?.tenant_id,
      role: user?.role,
    });
  }

  populateLeadDropdown() {
    const leadSelect = this.querySelector("#lead_id");
    if (!leadSelect) return;

    const currentValue = leadSelect.value;

    leadSelect.innerHTML = '<option value="">Select a Lead</option>';

    if (this.leads.length === 0) {
      leadSelect.innerHTML = '<option value="">No leads available</option>';
      return;
    }

    this.leads.forEach((lead) => {
      const leadName =
        `${lead.lead_first_name || ""} ${lead.lead_last_name || ""}`.trim();
      const option = document.createElement("option");
      option.value = lead.lead_id;
      option.textContent = leadName || lead.lead_email || "Unnamed Lead";
      leadSelect.appendChild(option);
    });
    if (currentValue) {
      leadSelect.value = currentValue;
    }

    console.log("Lead dropdown populated with", this.leads.length, "items");
    if (this.currentDealData && this.currentDealData.lead_id) {
      this.selectLeadInDropdown(this.currentDealData.lead_id);
    }
  }

  populateOrganizationDropdown() {
    const orgSelect = this.querySelector("#organization_id");
    if (!orgSelect) return;
    const currentValue = orgSelect.value;
    orgSelect.innerHTML = '<option value="">Select an Organization</option>';

    if (this.organizations.length === 0) {
      orgSelect.innerHTML =
        '<option value="">No organizations available</option>';
      return;
    }

    this.organizations.forEach((org) => {
      const option = document.createElement("option");
      option.value = org.organization_id;
      option.textContent = org.organization_name || "Unnamed Organization";
      orgSelect.appendChild(option);
    });
    if (currentValue) {
      orgSelect.value = currentValue;
    }

    console.log(
      "Organization dropdown populated with",
      this.organizations.length,
      "items",
    );
    if (this.currentDealData && this.currentDealData.organization_id) {
      this.selectOrganizationInDropdown(this.currentDealData.organization_id);
    }
  }

  async render() {
    console.log("Deal modal rendered");
  }

  disconnectedCallback() {
    if (this.dbWorker && this.messageHandler) {
      this.dbWorker.removeEventListener("message", this.messageHandler);
    }
  }
}

customElements.define("deal-modal", DealModal);
