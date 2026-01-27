const template = document.createElement("template");
template.innerHTML = `<div class="mb-4">
    <div class="relative">
      <div
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <svg
          class="w-4 h-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        class="search w-full pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search leads"
      />
    </div>
  </div>`;

class SearchBar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = template.innerHTML;
    this.render();
  }

  static get observedAttributes() {
    return ["data-search-type"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Inside attribute change: ${name} ${oldValue} ${newValue}`);
    this.render();
  }

  render() {
    let inputField = this.querySelector(".search");
    let idType = this.getAttribute("data-search-type");
    console.log("inside searchBar component: ", idType);
    inputField.id = idType;

    switch (idType) {
      case "organizations-search-input":
        inputField.setAttribute("placeholder", "Search organizations");
        break;
      case "leads-search-input":
        inputField.setAttribute("placeholder", "Search leads");
        break;
      case "deals-search-input":
        inputField.setAttribute("placeholder", "Search deals");
        break;
      case "users-search-input":
        inputField.setAttribute("placeholder", "Search users");
        break;
      default:
        console.log("Error in search input field");
        break;
    }
  }
}

customElements.define("search-bar", SearchBar);
