export function populateLeadsTable(leads) {
  const tbody = document.querySelector("#leads-body");

  if (!tbody) {
    console.error("Table body #leads-body not found!");
    return;
  }

  if (!leads || leads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-sm font-medium">No leads found</p>
          <p class="text-xs mt-1">Click "Create Lead" to add your first lead</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  leads.forEach((lead, index) => {
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
    const score = lead.score || "0";
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
      "Follow-Up":
        "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
      80: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      0: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    };

    const scoreColor = score == 0 ? scoreColors[0] : score > 40 ? scoreColors[40] : scoreColors[80];

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
      <td class="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
        ${createdDate}
      </td>
      <td class="px-3 py-4">
        <div class="flex flex-row gap-1">
            <a id="editLead" data-link="/leadDetails" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </a>
            <a id="deleteLead" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </a>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });
  console.log(`Populated leads table with ${leads.length} lead(s)`);
  
  // Dispatch event for filter to update
  document.dispatchEvent(new CustomEvent('leadsPopulated', {
    detail: { leads }
  }));
}
