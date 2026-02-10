
export function appendLeadRow(lead) {
  const tbody = document.querySelector("#leads-body");
  if (!tbody) {
    console.error("Table body #leads-body not found!");
    return;
  }

  const noDataRow = tbody.querySelector('td[colspan]');
  if (noDataRow) {
    tbody.innerHTML = "";
  }

  const row = document.createElement("tr");
  row.setAttribute("data-lead-id", lead.lead_id);
  row.className =
    "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors";

  const fullName =
    `${lead.lead_first_name || ""} ${lead.lead_last_name || ""}`.trim() ||
    "Unknown";
  const email = lead.lead_email || "No email";
  const mobile = lead.lead_mobile_number || "No mobile";
  const organization = lead.organization_name || "N/A";
  const createdDate = lead.created_on
    ? new Date(lead.created_on).toLocaleDateString()
    : "N/A";
  const score = lead.score || lead.lead_score || "0";
  const status = lead.lead_status || "New";

  const statusColors = {
    New: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    "Follow-Up":
      "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
    Converted:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    Dead: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  };

  const statusColor =
    statusColors[status] ||
    "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";

  const scoreColors = {
    40: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    80: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    0: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  };

  const scoreColor =
    score == 0
      ? scoreColors[0]
      : score > 40
        ? scoreColors[80]
        : scoreColors[40];

  row.innerHTML = `
    <td class="w-4 p-4">
      <input type="checkbox" class="item-checkbox w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2" value="${lead.lead_id}" />
    </td>
    <th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
      ${fullName}
    </th>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
      ${organization}
    </td>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
      ${email}
    </td>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
      ${mobile}
    </td>
    <td class="px-6 py-4">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
        ${status}
      </span>
    </td>
    <td class="px-6 py-4">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreColor}">
        ${score}
      </span>
    </td>
    <td class="px-3 py-4">
      <div class="relative">
        <button class="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        <div class="dropdown-menu hidden">
          <a id="editLead" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            View/Edit
          </a>
          <a id="deleteLead" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </a>
        </div>
      </div>
    </td>
  `;

  tbody.insertBefore(row, tbody.firstChild);
}

export function appendOrganizationRow(organization) {
  const tbody = document.querySelector("#organizations-body");
  if (!tbody) {
    console.error("Table body #organizations-body not found!");
    return;
  }

  const noDataRow = tbody.querySelector('td[colspan]');
  if (noDataRow) {
    tbody.innerHTML = "";
  }

  const row = document.createElement("tr");
  row.setAttribute("data-organization-id", organization.organization_id);
  row.className =
    "border-b border-gray-100 dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-700/40 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors";

  row.innerHTML = `
    <td class="w-4 p-4">
      <input type="checkbox" class="item-checkbox w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2" value="${organization.organization_id}" />
    </td>
    <td scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
      ${organization.organization_name}
    </th>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${organization.organization_size || "N/A"}</td>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${organization.organization_website_name || ""}</td>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${organization.organization_industry || ""}</td>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
      ${organization.created_on ? new Date(organization.created_on).toLocaleDateString() : "N/A"}
    </td>
    <td class="px-3 py-4">
      <div class="flex flex-row gap-1">
        <a id="editOrganization" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </a>
        <a id="deleteOrganization" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </a>
      </div>
    </td>
  `;

  tbody.insertBefore(row, tbody.firstChild);
}

export function appendDealRow(deal) {
  const tbody = document.querySelector("#deals-body");
  if (!tbody) {
    console.error("Table body #deals-body not found!");
    return;
  }

  const noDataRow = tbody.querySelector('td[colspan]');
  if (noDataRow) {
    tbody.innerHTML = "";
  }

  const row = document.createElement("tr");
  row.setAttribute("data-deal-id", deal.deal_id);
  row.className =
    "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors";

  const dealName = deal.deal_name || `Deal #${deal.deal_id}`;
  const dealValue = deal.deal_value
    ? `$${Number(deal.deal_value).toLocaleString()}`
    : "$0";
  const status = deal.deal_status || "Prospecting";
  const modifiedDate = deal.modified_on
    ? new Date(deal.modified_on).toLocaleDateString()
    : "N/A";

  const statusColors = {
    Prospecting:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    Qualification:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    Negotiation:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    "Ready to close":
      "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
    Won: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    Lost: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  };

  const statusColor =
    statusColors[status] ||
    "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";

  row.innerHTML = `
    <td class="w-4 p-4">
      <input type="checkbox" class="item-checkbox w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2" value="${deal.deal_id}" />
    </td>
    <th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
      ${dealName}
    </th>
    <td class="px-6 py-4 text-gray-900 dark:text-white font-semibold">
      ${dealValue}
    </td>
    <td class="px-6 py-4">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
        ${status}
      </span>
    </td>
    <td class="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
      ${modifiedDate}
    </td>
    <td class="px-3 py-4">
      <div class="flex flex-row gap-1">
        <a id="editDeal" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </a>
        <a id="deleteDeal" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </a>
      </div>
    </td>
  `;

  tbody.insertBefore(row, tbody.firstChild);
}

export function removeRowById(tableBodyId, dataAttribute, id) {
  const tbody = document.querySelector(`#${tableBodyId}`);
  if (!tbody) {
    console.error(`Table body #${tableBodyId} not found!`);
    return;
  }

  const row = tbody.querySelector(`tr[${dataAttribute}="${id}"]`);
  if (row) {
    row.remove();
    if (tbody.querySelectorAll('tr').length === 0) {
      showNoDataMessage(tableBodyId);
    }
  }
}

export function updateRowById(tableBodyId, dataAttribute, id, data, renderFunction) {
  removeRowById(tableBodyId, dataAttribute, id);
  renderFunction(data);
}

function showNoDataMessage(tableBodyId) {
  const tbody = document.querySelector(`#${tableBodyId}`);
  if (!tbody) return;

  let message = "No data found.";
  let colspan = "8";

  if (tableBodyId === "leads-body") {
    message = "No leads found. Click \"Create Lead\" to add your first lead";
  } else if (tableBodyId === "organizations-body") {
    message = "No organizations found. Click \"Create\" to add your first organization.";
    colspan = "7";
  } else if (tableBodyId === "deals-body") {
    message = "No deals found. Click \"Create Deal\" to add your first deal";
  }

  tbody.innerHTML = `
    <tr>
      <td colspan="${colspan}" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-sm font-medium">${message}</p>
      </td>
    </tr>
  `;
}
