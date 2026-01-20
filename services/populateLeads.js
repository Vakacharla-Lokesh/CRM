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
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${lead.organizationName || "N/A"}</td>
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
    `;

    tbody.appendChild(row);
  });

  // console.log("Table populated with", leads.length, "rows");
}
