const template = `<td class="w-4 p-4">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="lead-checkbox"
                class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
              />
            </div>
          </td>
          <th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
            <span id="lead-name"></span>
          </th>
          <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
            <span id="organization-name"></span>
          </td>
          <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
            <span id="lead-email"></span>
          </td>
          <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
            <span id="lead-phone"></span>
          </td>
          <td class="px-6 py-4">
            <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              Active
            </span>
          </td>
          <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
            <span id="created-date"></span>
          </td>
          <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M12 6h.01M12 12h.01M12 18h.01"/>
            </svg>
          </td>`;

class LeadsDataRow extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Create tr element as template since custom elements can't be <tr> directly
    // const tr = document.createElement("tr");
    // tr.className =
    //   "border-b border-gray-100 dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-700/40 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors";
    // tr.innerHTML = template;

    this.shadowRoot.innerHTML = template;
    // this.shadowRoot.appendChild(tr);

    this.render();
  }

  static get observedAttributes() {
    return [
      "lead-id",
      "lead-first-name",
      "lead-last-name",
      "organization-name",
      "lead-email",
      "lead-mobile-number",
      "created-on",
    ];
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML) {
      this.render();
    }
  }

  render() {
    const firstName = this.getAttribute("lead-first-name") || "";
    const lastName = this.getAttribute("lead-last-name") || "";
    const leadId = this.getAttribute("lead-id") || "";

    const checkbox = this.shadowRoot.querySelector("#lead-checkbox");
    if (checkbox) {
      checkbox.value = leadId;
    }

    const nameElement = this.shadowRoot.querySelector("#lead-name");
    if (nameElement) {
      nameElement.textContent = `${firstName} ${lastName}`.trim();
    }

    const orgElement = this.shadowRoot.querySelector("#organization-name");
    if (orgElement) {
      orgElement.textContent = this.getAttribute("organization-name") || "N/A";
    }

    const emailElement = this.shadowRoot.querySelector("#lead-email");
    if (emailElement) {
      emailElement.textContent = this.getAttribute("lead-email") || "";
    }

    const phoneElement = this.shadowRoot.querySelector("#lead-phone");
    if (phoneElement) {
      phoneElement.textContent = this.getAttribute("lead-mobile-number") || "";
    }

    const dateElement = this.shadowRoot.querySelector("#created-date");
    if (dateElement) {
      const createdOn = this.getAttribute("created-on");
      if (createdOn) {
        dateElement.textContent = new Date(createdOn).toLocaleDateString();
      } else {
        dateElement.textContent = "N/A";
      }
    }
  }
}

customElements.define("leads-row", LeadsDataRow);
