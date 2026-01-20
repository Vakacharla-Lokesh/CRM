import "../components/LeadsDataRow.js";

export function populateLeadsTable(leads) {
  // console.log("populateLeadsTable called with:", leads);
  const tbody = document.querySelector("#leads-body");

  if (!tbody) {
    console.error("Table body not found!");
    return;
  }

  if (!leads || leads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
          No leads found. Click "Create" to add your first lead.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  leads.forEach((lead) => {
    const row = document.createElement("tr");
    row.setAttribute("data-lead-id", lead.lead_id);
    row.className =
      "border-b border-gray-100 dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-700/40 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors";

    row.innerHTML = `
      <td class="w-4 p-4">
        <div class="flex items-center">
          <input
            type="checkbox"
            value="${lead.lead_id}"
            class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
          />
        </div>
      </td>

      <th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
        ${lead.lead_first_name || ""} ${lead.lead_last_name || ""}
      </th>

      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${lead.organization_name || "N/A"}</td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${lead.lead_email || ""}</td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${lead.lead_mobile_number || ""}</td>

      <td class="px-6 py-4">
        <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
          Active
        </span>
      </td>

      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
        ${lead.created_on ? new Date(lead.created_on).toLocaleDateString() : "N/A"}
      </td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
        <div class="relative inline-block">
          <button
            type="button"
            class="dropdown-btn flex items-center justify-center w-8 h-8 rounded"
          >
            <svg class="w-6 h-6 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                d="M12 6h.01M12 12h.01M12 18h.01" />
            </svg>
          </button>

          <div
            class="dropdown-menu hidden absolute right-0 top-full mt-2 w-20 bg-white border border-gray-200 rounded shadow-lg z-50 even:bg-gray-50 dark:even:bg-gray-700/40 hover:bg-blue-50 dark:hover:bg-blue-500/10"
          >
            <ul class="py-1 text-sm even:bg-gray-50 dark:even:bg-gray-700/40 hover:bg-blue-50 dark:hover:bg-blue-500/10">
              <li><a data-link="/edit-lead"  class="block px-4 py-2 hover:bg-gray-100">Edit</a></li>
              <li><a data-lead-id=${lead.lead_id} id="deleteLead" class="block px-4 py-2 hover:bg-gray-100">Delete</a></li>
            </ul>
          </div>
        </div>
      </td>
`;

    // const row = document.createElement("leads-row");
    // row.setAttribute("lead-id", lead.lead_id);
    // row.setAttribute("lead-first-name", lead.lead_first_name);
    // row.setAttribute("lead-last-name", lead.lead_last_name);
    // row.setAttribute("organization-name", lead.organization_name);
    // row.setAttribute("lead-email", lead.lead_email);
    // row.setAttribute("lead-mobile-number", lead.lead_mobile_number);
    // row.setAttribute(
    //   "created-on",
    //   lead.created_on ? new Date(lead.created_on).toLocaleDateString() : "N/A",
    // );

    tbody.appendChild(row);
  });

  // console.log("Table populated with", leads.length, "rows");
}
