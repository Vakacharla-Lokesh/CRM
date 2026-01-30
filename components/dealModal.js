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
          Add Deal
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
                min="0"
                step="0.01"
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
                Associated Lead
              </label>
              <select
                id="lead_id"
                name="lead_id"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select a Lead</option>
              </select>
            </div>
            <div>
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
                <option value="">Select an Organization</option>
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
            Add Deal
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
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }

    this.render();
    this.setupListeners();
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

    const dbWorker = window.dbWorker;
    if (!dbWorker) return;

    dbWorker.addEventListener("message", (e) => {
      const { action, data } = e.data;

      if (action === "getByIdSuccess" && data && data.deal_id) {
        // console.log("Inside idsuccess: ", data);
        // this.populateForm(data);
        this.setEditMode(data);
      }
    });
  }

  setEditMode(dealData) {
    this.editMode = true;
    this.currentDealData = dealData;

    const modalTitle = this.querySelector("#deal-modal-title");
    const submitBtn = this.querySelector("#deal-submit-btn");

    if (modalTitle) modalTitle.textContent = "Edit Deal";
    if (submitBtn) submitBtn.textContent = "Update Deal";

    this.populateForm(dealData);
  }

  setCreateMode() {
    this.editMode = false;
    this.currentDealData = null;

    const modalTitle = this.querySelector("#deal-modal-title");
    const submitBtn = this.querySelector("#deal-submit-btn");
    const form = this.querySelector("#deal-form");

    if (modalTitle) modalTitle.textContent = "Add Deal";
    if (submitBtn) submitBtn.textContent = "Add Deal";
    if (form) form.reset();

    const dealIdField = this.querySelector("#deal_id_hidden");
    if (dealIdField) dealIdField.value = "";
  }

  populateForm(data) {
    if (!data) return;
    console.log("Inside populateform: ", data);

    const fields = {
      deal_id_hidden: data.deal_id || "",
      deal_name: data.deal_name || "",
      deal_value: data.deal_value || "",
      lead_id: data.lead_id || "",
      organization_id: data.organization_id || "",
      deal_status: data.deal_status || "Prospecting",
    };

    Object.keys(fields).forEach((fieldId) => {
      const field = this.querySelector(`#${fieldId}`);
      if (field) {
        field.value = fields[fieldId];
      }
    });
  }

  closeModal() {
    const modal = this.querySelector("#deal-form-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
    const form = this.querySelector("#deal-form");
    if (form) form.reset();
  }

  async render() {
    console.log("Deal modal rendered");
  }
}

customElements.define("deal-modal", DealModal);
