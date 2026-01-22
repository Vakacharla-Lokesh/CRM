import { eventBus, EVENTS } from "../events/eventBus.js";
import { loadRoute } from "../router.js";

const template = document.createElement("template");
template.innerHTML = `
  <aside
          id="default-sidebar"
          class="z-40 w-64 shrink-0 h-[calc(100vh-4rem)] border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-transform -translate-x-full sm:translate-x-0"
          aria-label="Sidebar"
        >
          <div class="h-full px-3 py-4 overflow-y-auto flex flex-col">
            <nav
              id="sidebar"
              class="flex flex-col gap-2"
            >
              <a
                data-link="/home"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                  />
                </svg>
                <span>Home</span>
              </a>
              <a
                data-link="/organizations"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Organizations</span>
              </a>
              <a
                data-link="/leads"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
                  />
                </svg>
                <span>Leads</span>
              </a>
              <a
                data-link="/deals"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Deals</span>
              </a>
            </nav>
          </div>
        </aside>
`;

class AppSidebar extends HTMLElement {
  constructor() {
    super();
    this.currentRoute = sessionStorage.getItem("currentTab");
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }
    this.setupEventListeners();
  }

  setupEventListeners() {
    // console.log("Inside setup event listener");
    const links = this.querySelectorAll("a[data-link]");
    links.forEach((link) => {
      // console.log(link);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        if (!link) return;

        const path = link.getAttribute("data-link");
        loadRoute(path);
      });
    });
  }

  updateActiveLink(route) {
    const links = this.querySelectorAll("a[data-link]");
    links.forEach((link) => {
      const linkRoute = link.getAttribute("data-lnik");
      link.classList.toggle("active", linkRoute === route);
    });
  }
}

customElements.define("app-sidebar", AppSidebar);

{
  /* <div class="mt-auto pt-4">
              <div
                id="User"
                class="h-32 w-full overflow-y-auto bg-gray-100 dark:bg-gray-900 rounded p-2 text-xs font-mono"
              >
                <button
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors"
                >
                  <a data-link="/login">Login</a>
                </button>
                <button
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors"
                >
                  Logout
                </button>
              </div>
            </div> */
}
