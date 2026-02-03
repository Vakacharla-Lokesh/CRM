class TabHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="bg-white dark:bg-gray-800">
        <div class="flex gap-6 px-6 text-sm font-medium">
          ${["Details", "Calls", "Comments", "Attachments"]
            .map(
              (tab, i) => `
            <button
              data-tab="${tab.toLowerCase()}"
              class="tab-btn pb-2 transition-colors ${
                i === 0
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }"
            >
              ${tab}
            </button>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }
}
customElements.define("tab-header", TabHeader);
