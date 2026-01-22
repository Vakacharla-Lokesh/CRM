class TabContent extends HTMLElement {
  connectedCallback() {
    this.render("details");
  }

  async render(activeTab) {
    const leadId = sessionStorage.getItem("lead_id");

    let content = "";

    switch (activeTab) {
      case "details":
        content = `<lead-details></lead-details>`;
        break;
      case "calls":
        content = `<calls-content lead-id="${leadId}"></calls-content>`;
        break;
      case "comments":
        content = `<comments-content lead-id="${leadId}"></comments-content>`;
        break;
      case "attachments":
        content = `<attachments-content lead-id="${leadId}"></attachments-content>`;
        break;
      default:
        content = `<lead-details></lead-details>`;
    }

    this.innerHTML = `
          <div class="p-6 bg-white dark:bg-gray-800">
            ${content}
          </div>
        `;
  }
}
customElements.define("tab-content", TabContent);
