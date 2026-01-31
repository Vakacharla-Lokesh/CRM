export function populateUsersTable(users) {
  const tbody = document.querySelector("#users-body");

  if (!tbody) {
    console.error("Table body #users-body not found!");
    return;
  }

  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-sm font-medium">No users found</p>
          <p class="text-xs mt-1">Click "Create User" to add your first lead</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  users.forEach((user, index) => {
    const row = document.createElement("tr");
    row.setAttribute("data-user-id", user.user_id);
    // console.log(`Inside mapping: ${user.user_id}`);
    row.className =
      "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors";

    const fullName =
      `${user.first_name || ""} ${user.last_name || ""} ${user.name || ""}`.trim() ||
      "Unknown";
    const email = user.user_email || "No email";
    const mobile = user.mobile || "No mobile";
    const role = user.role || "Not defined";

    const createdDate = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "N/A";

    row.innerHTML = `
      <td class="w-4 p-4">
        <input type="checkbox" class="item-checkbox w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2" 
        value="${user.user_id}"
      />
      </td>
      <th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
        ${fullName}
      </th>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
        ${email}
      </td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
        ${mobile}
      </td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
        ${role}
      </td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
        ${createdDate}
      </td>
      <td class="px-3 py-4">
        <div class="flex flex-row gap-1">
            <a id="deleteUser" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </a>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });

  const pagination = document.getElementById("users-pagination");
  if (pagination) {
    pagination.initialize("users-body", users);
  }

  console.log(`Populated users table with ${users.length} lead(s)`);
}
