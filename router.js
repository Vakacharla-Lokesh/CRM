let routes = {
  "/": "index.html",
  "/home": "/pages/home.html",
  "/leads": "/pages/leads.html",
  "/organizations": "/pages/organizations.html",
};

let sidebar = document.getElementById("sidebar");

const dbWorker = window.dbWorker;

dbWorker.addEventListener("message", (e) => {
  console.log("Working before if: ");
  console.log(e);
  if (e.data.action === "getAllSuccess" && e.data.storeName === "Leads") {
    console.log("Working in if: ");
    populateLeadsTable(e.data.leads);
  }
});

function populateLeadsTable(leads) {
  console.log("leads data in fn: ", leads);
  const tbody = document.querySelector("#leads-body");
  if (!tbody) return;

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
            value=""
            class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
          />
        </div>
      </td>
      <th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
        ${lead.lead_first_name} ${lead.lead_last_name}
      </th>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${lead.organizationName || "N/A"}</td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${lead.lead_email}</td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${lead.lead_mobile_number}</td>
      <td class="px-6 py-4">
        <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
          Active
        </span>
      </td>
      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
        ${new Date(lead.modified_on).toLocaleDateString()}
      </td>
    `;

    tbody.appendChild(row);
  });
}

async function loadRoute(path) {
  const route = routes[path] || routes["/home"];

  const html = await fetch(route).then((res) => res.text());

  document.getElementById("main-page").innerHTML = html;
  if (path === "/leads") {
    console.log("msg sent to all worker get");
    dbWorker.postMessage({ action: "getAllLeads" });
    console.log("msg after post message");
  }

  sessionStorage.setItem("currentTab", path);

  sidebar.querySelectorAll("a").forEach((link) => {
    if (link.getAttribute("data-link") === path) {
      link.classList.add("bg-neutral-tertiary", "text-fg-brand");
    } else {
      link.classList.remove("bg-neutral-tertiary", "text-fg-brand");
    }
  });
}

sidebar.addEventListener("click", (event) => {
  event.preventDefault();
  const link = event.target.closest("a");
  if (!link) return;
  const path = link.getAttribute("data-link");
  loadRoute(path);
});

window.addEventListener("DOMContentLoaded", () => {
  const savedTab = sessionStorage.getItem("currentTab") || "/home";
  loadRoute(savedTab);
});
