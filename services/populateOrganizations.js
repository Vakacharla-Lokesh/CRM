export function populateOrganizationsTable(organizations) {
  // console.log("populateLeadsTable called with:", leads);
  const tbody = document.querySelector("#organizations-body");
  console.log("inside populate orgs fn");

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
    // console.log(organization);
    const row = document.createElement("tr");
    row.setAttribute("data-organization-id", organization.organization_id);
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
      <td class="px-3 py-4">
        <div class="relative inline-block">
          <button type="button" class="dropdown-btn p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label="Actions menu">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          <div class="dropdown-menu hidden absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
            <a href="#" data-action="edit" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </a>
            <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <a href="#" id="deleteOrganization" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </a>
          </div>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });

  // console.log("Table populated with", organizations.length, "rows");
}
