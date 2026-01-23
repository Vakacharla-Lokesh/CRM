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
          Create Organization
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
      >
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
              value="hello"
            />
          </div>

          <div class="mb-4">
            <label
              for="organization_size"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Organiztion Size</label
            >
            <input
              type="number"
              id="organization_size"
              placeholder="1-1000"
              required
              class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
              value="hello"
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
              value="hello@gmail.com"
            />
          </div>

          <div class="mb-4">
            <label
              for="organization_industry"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Industry</label
            >
            <input
              type="text"
              id="organization_industry"
              placeholder="Software"
              required
              class="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700"
            />
          </div>
        </div>
        <button
          type="submit"
          class="w-full mb-3 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none shadow"
        >
          Create Organization
        </button>
      </form>
    </div>
  </div>
</div>`;
class OrganizationModal extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }

    this.render();
  }

  async render() {
      console.log("Inside render()");
    //   await searchFeature();
  }
}

customElements.define("organization-modal", OrganizationModal);
