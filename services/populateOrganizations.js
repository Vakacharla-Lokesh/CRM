export function populateOrganizationsTable(organizations) {
  // console.log("populateLeadsTable called with:", leads);
  const tbody = document.querySelector("#organizations-body");

  if (!tbody) {
    console.error("Table body not found!");
    return;
  }

  if (!organizations || organizations.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
          No organizations found. Click "Create" to add your first organization.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  organizations.forEach((organization) => {
    const row = document.createElement("tr");
    row.className =
      "border-b border-gray-100 dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-700/40 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors";

    row.innerHTML = `
      <td class="w-4 p-4">
        <div class="flex items-center">
          <input
            type="checkbox"
            value="${organization.organization_id}"
            class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
          />
        </div>
      </td>
      <th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
        ${organization.organization_name}
      </th>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${organization.organization_size || "N/A"}</td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${organization.organization_website_name || ""}</td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${organization.organization_industry || ""}</td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
        ${organization.created_on ? new Date(organization.created_on).toLocaleDateString() : "N/A"}
      </td>
    `;

    tbody.appendChild(row);
  });

  // console.log("Table populated with", organizations.length, "rows");
}
