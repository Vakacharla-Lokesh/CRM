export function populateDealsTable(deals) {
  const tbody = document.querySelector("#deals-body");
  // console.log(tbody);
  // console.log("Inside fn");

  if (!tbody) {
    console.error("Table body #deals-body not found!");
    return;
  }

  if (!deals || deals.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-medium">No deals found</p>
          <p class="text-xs mt-1">Click "Create Deal" to add your first deal</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  deals.forEach((deal, index) => {
    const row = document.createElement("tr");
    row.setAttribute("data-deal-id", deal.deal_id);
    row.className =
      "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors";

    const dealName = deal.deal_name || `Deal #${deal.deal_id}`;
    const leadName = deal.lead_first_name
      ? `${deal.lead_first_name} ${deal.lead_last_name || ""}`.trim()
      : "N/A";
    const organization = deal.organization_name || "N/A";
    const dealValue = deal.deal_value
      ? `$${Number(deal.deal_value).toLocaleString()}`
      : "$0";
    const status = deal.deal_status || "Prospecting";
    const createdDate = deal.created_on
      ? new Date(deal.created_on).toLocaleDateString()
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
      <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
        ${leadName}
      </td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
        ${organization}
      </td>
      <td class="px-6 py-4 text-gray-900 dark:text-white font-semibold">
        ${dealValue}
      </td>
      <td class="px-6 py-4">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
          ${status}
        </span>
      </td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
        ${createdDate}
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
    tbody.appendChild(row);
  });
  console.log(`Populated deals table with ${deals.length} deal(s)`);
}
