const template = `<tr
          class="border-b border-gray-100 dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-700/40 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
        >
          <td class="w-4 p-4">
            <div class="flex items-center">
              <input
                id="table-checkbox-22"
                type="checkbox"
                value=""
                class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
              />
              <label
                for="table-checkbox-22"
                class="sr-only"
                >Table checkbox</label
              >
            </div>
          </td>
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
          >
            Apple MacBook Pro 17"
          </th>

          <td class="px-6 py-4 text-gray-600 dark:text-gray-300">Silver</td>
          <td class="px-6 py-4 text-gray-600 dark:text-gray-300">Laptop</td>
          <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
            $2999
          </td>
          <td class="px-6 py-4">
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            >
              231
            </span>
          </td>
          <td class="px-6 py-4 text-gray-600 dark:text-gray-300">2 days ago</td>
        </tr>`;

class LeadsDataRow extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = template;
  }

  connectedCallback() {
    console.log("New Data row added");
  }

  disconnectedCallback() {
    console.log("Data row removed");
  }
}

customElements.define("leads-row", LeadsDataRow);
