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
        <h3 id="modal-title" class="text-lg font-medium text-gray-900 dark:text-white">
          Add Organization
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
        data-form="createOrganization"
        id="organization-form"
      >
        <input type="hidden" id="organization_id" name="organization_id" value="">
        
        <div
          class="grid grid-cols-2 gap-4 border-b border-gray-200 dark:border-gray-700 pb-4"
        >
          <div class="mb-4">
            <label
              for="organization_name"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Organization Name</label
            >
            <input
              type="text"
              id="organization_name"
              placeholder="Organization Name"
              required
              class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div class="mb-4">
            <label
              for="organization_size"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Organization Size</label
            >
            <input
              type="number"
              id="organization_size"
              placeholder="1-1000"
              min=1
              max=10000000
              required
              class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div class="mb-4">
            <label
              for="organization_website_name"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Website</label
            >
            <input
              type="url"
              id="organization_website_name"
              placeholder="https://example.com"
              required
              class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div class="mb-4">
            <label
              for="organization_industry"
              class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Industry
            </label>
            <select
              id="organization_industry"
              name="organization_industry"
              class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="Software">Software</option>
              <option value="Foods">Foods</option>
              <option value="Textile">Textile</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>
        <div class="my-6">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-3">
            Point of Contact
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="contact_name"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Contact Name
              </label>
              <input
                type="text"
                id="contact_name"
                name="contact_name"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label
                for="contact_number"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                id="contact_number"
                name="contact_number"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          id="submit-btn"
          class="w-full mb-3 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none shadow"
        >
          Add Organization
        </button>
      </form>
    </div>
  </div>
</div>`;

class OrganizationModal extends HTMLElement {
  constructor() {
    super();
    this.editMode = false;
    this.currentOrgData = null;
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }

    this.render();
    this.setupListeners();
    this.setupModalOpenListener();

    // Initialize in create mode
    this.setCreateMode();
  }

  setupModalOpenListener() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("#open-modal-btn")) {
        const currentPath = sessionStorage.getItem("currentTab");
        if (currentPath === "/organizations") {
          sessionStorage.removeItem("organization_id");
          setTimeout(() => {
            this.setCreateMode();
          }, 0);
        }
      }
    });
  }

  setupListeners() {
    const dbWorker = window.dbWorker;
    if (!dbWorker) return;

    dbWorker.addEventListener("message", (e) => {
      const { action, data, id } = e.data;

      if (action === "getByIdSuccess" && data && data.organization_id) {
        const orgId = sessionStorage.getItem("organization_id");
        if (orgId && orgId === data.organization_id) {
          this.setEditMode(data);
        }
      }
    });
  }

  setEditMode(organizationData) {
    this.editMode = true;
    this.currentOrgData = organizationData;

    const modalTitle = this.querySelector("#modal-title");
    const submitBtn = this.querySelector("#submit-btn");

    if (modalTitle) modalTitle.textContent = "Edit Organization";
    if (submitBtn) submitBtn.textContent = "Update Organization";

    this.populateForm(organizationData);
  }

  setCreateMode() {
    this.editMode = false;
    this.currentOrgData = null;

    const orgDraft = sessionStorage.getItem("organizationDraft");

    const modalTitle = this.querySelector("#modal-title");
    const submitBtn = this.querySelector("#submit-btn");
    const form = this.querySelector("#organization-form");

    if (modalTitle) modalTitle.textContent = "Add Organization";
    if (submitBtn) submitBtn.textContent = "Add Organization";

    if (orgDraft != null) {
      
    } else if (form) form.reset();
    const orgIdField = this.querySelector("#organization_id");
    if (orgIdField) orgIdField.value = "";
    const fields = [
      "organization_name",
      "organization_size",
      "organization_website_name",
      "contact_name",
      "contact_number",
    ];

    fields.forEach((fieldId) => {
      const field = this.querySelector(`#${fieldId}`);
      if (field) field.value = "";
    });

    // Reset industry dropdown to default
    const industryField = this.querySelector("#organization_industry");
    if (industryField) industryField.value = "Software";
  }

  populateForm(data) {
    if (!data) return;

    const fields = {
      organization_id: data.organization_id || "",
      organization_name: data.organization_name || "",
      organization_size: data.organization_size || "",
      organization_website_name: data.organization_website_name || "",
      organization_industry: data.organization_industry || "Software",
      contact_name: data.contact_name || "",
      contact_number: data.contact_number || "",
    };

    Object.keys(fields).forEach((fieldId) => {
      const field = this.querySelector(`#${fieldId}`);
      if (field) {
        field.value = fields[fieldId];
      }
    });
  }

  async render() {
    console.log("Organization modal rendered");
  }
}

customElements.define("organization-modal", OrganizationModal);
