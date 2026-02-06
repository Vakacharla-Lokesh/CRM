const template = document.createElement("template");
template.innerHTML = `<div
  id="form-modal"
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
          Add New Lead
        </h3>
        <button
          id="close-modal-btn"
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
        data-form="createLead"
      >
        <!-- Lead Information -->
        <div class="mb-4">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-3">
            Lead Information
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="first_name"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label
                for="last_name"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Doe"
              />
            </div>
            <div>
              <label
                for="email"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label
                for="mobile_number"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobile_number"
                name="mobile_number"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
        </div>

        <!-- Organization Information -->
        <div class="mb-4">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-3">
            Organization Information
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="organization_name"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Organization Name
              </label>
              <input
                type="text"
                id="organization_name"
                name="organization_name"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Acme Inc"
              />
            </div>
            <div>
              <label
                for="organization_website_name"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Website
              </label>
              <input
                type="url"
                id="organization_website_name"
                name="organization_website_name"
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label
                for="organization_size"
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Company Size
              </label>
              <input
                type="number"
                id="organization_size"
                name="organization_size"
                min=1
                max=10000000
                class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="1-50"
              />
            </div>
            <div>
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
        </div>

        <!-- User Assignment (Admin Only) -->
        <div id="user-assignment-section" class="mb-6 hidden">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-3">
            Assign Lead
          </h4>
          <div id="user-select-container"></div>
        </div>
        <!-- Submit Button -->
        <div class="flex gap-3">
          <button
            type="submit"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
          >
            Add Lead
          </button>
          <button
            type="button"
            id="close-modal-btn"
            class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</div>`;
class LeadModal extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }

    // this.render();
  }

  // async render() {
  //   // console.log("Inside render()");
  //   //   await searchFeature();
  // }
}

customElements.define("lead-modal", LeadModal);
