import { offlineManager } from "../services/offlineManager.js";

export function populateOrganizationsTable(organizations) {
  // console.log("populateLeadsTable called with:", leads);
  const tbody = document.querySelector("#organizations-body");
  console.log("inside populate orgs fn");

  if (!tbody) {
    console.error("Table body not found!");
    return;
  }

  // Merge offline data
  const offlineOrgs = offlineManager.getOfflineData('organizations') || [];
  const allOrgs = [...organizations, ...offlineOrgs];

  if (!allOrgs || allOrgs.length === 0) {
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

  allOrgs.forEach((organization) => {
    const isOffline = organization._offline === true;
    // console.log(organization);
    const row = document.createElement("tr");
    row.setAttribute("data-organization-id", organization.organization_id);
    row.className = `
      border-b border-gray-100 dark:border-gray-700 
      even:bg-gray-50 dark:even:bg-gray-700/40 
      hover:bg-blue-50 dark:hover:bg-blue-500/10 
      transition-colors
      ${isOffline ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500' : ''}
    `.trim();

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
        ${isOffline 
          ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">📴 Offline</span>'
          : (organization.created_on ? new Date(organization.created_on).toLocaleDateString() : "N/A")
        }
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

    tbody.appendChild(row);
  });
  console.log("Table populated with", allOrgs.length, "rows (", offlineOrgs.length, "offline)");
}
