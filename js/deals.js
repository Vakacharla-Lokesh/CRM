import { eventBus, EVENTS } from "../events/eventBus.js";
import { populateDealsTable } from "../controllers/populateDeals.js";

let dbWorker = null;
let allLeads = [];
let allOrganizations = [];
let dealsMessageHandler = null;

export function initializeDealsPage(worker) {
  dbWorker = worker;

  // Load initial data
  loadAllDeals();
  loadLeadsForDropdown();
  loadOrganizationsForDropdown();

  // Event listeners
  eventBus.on(EVENTS.DB_READY, loadAllDeals);

  // Form submission
  document.addEventListener("submit", (event) => {
    if (event.target.matches("form[data-form='createDeal']")) {
      event.preventDefault();
      handleDealCreate(event.target);
    }
  });

  // Modal controls
  document.addEventListener("click", (e) => {
    if (e.target.closest("#deleteDeal")) {
      e.stopImmediatePropagation();
      handleDeleteDeal(e);
    }

    // Modal open/close handlers
    if (e.target.closest("#open-modal-btn")) {
      document.getElementById("form-modal")?.classList.remove("hidden");
    }

    if (e.target.closest("#close-modal-btn")) {
      document.getElementById("form-modal")?.classList.add("hidden");
    }
  });

  const selectAllCheckbox = document.getElementById("select-all-deals");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      const checkboxes = document.querySelectorAll(".item-checkbox");
      checkboxes.forEach((checkbox) => {
        checkbox.checked = this.checked;
      });
    });
  }

  // Item checkboxes
  document.addEventListener("change", function (event) {
    if (event.target.classList.contains("item-checkbox")) {
      const allCheckboxes = document.querySelectorAll(".item-checkbox");
      const allChecked = Array.from(allCheckboxes).every((cb) => cb.checked);
      selectAllCheckbox.checked = allChecked;
    }
  });
}

function loadAllDeals() {
  if (!dbWorker) return;

  const messageHandler = (e) => {
    const { action, data, storeName } = e.data;

    if (action === "getAllSuccess" && storeName === "Deals") {
      populateDealsTable(data || []);
    }
  };

  // Use a unique identifier to track this listener
  const currentPath = sessionStorage.getItem("currentTab");
  if (currentPath === "/deals") {
    // Remove any old deal message handlers
    if (dealsMessageHandler) {
      dbWorker.removeEventListener("message", dealsMessageHandler);
    }
    dealsMessageHandler = messageHandler;
    dbWorker.addEventListener("message", dealsMessageHandler);
  }

  dbWorker.postMessage({
    action: "getAllDeals",
    storeName: "Deals",
  });
}

function loadLeadsForDropdown() {
  if (!dbWorker) return;

  dbWorker.postMessage({
    action: "getAllLeads",
    storeName: "Leads",
  });

  populateLeadDropdown();
}

function loadOrganizationsForDropdown() {
  if (!dbWorker) return;

  dbWorker.postMessage({
    action: "getAllOrganizations",
    storeName: "Organizations",
  });

  populateOrganizationDropdown();
}

function populateLeadDropdown() {
  const leadSelect = document.getElementById("lead_id");
  if (!leadSelect) return;

  const currentValue = leadSelect.value;
  leadSelect.innerHTML = '<option value="">Select a Lead</option>';

  allLeads.forEach((lead) => {
    const leadName = `${lead.lead_first_name} ${lead.lead_last_name}`;
    const option = document.createElement("option");
    option.value = lead.lead_id;
    option.textContent = leadName;
    leadSelect.appendChild(option);
  });

  if (currentValue) {
    leadSelect.value = currentValue;
  }
}

function populateOrganizationDropdown() {
  const orgSelect = document.getElementById("organization_id");
  if (!orgSelect) return;

  const currentValue = orgSelect.value;
  orgSelect.innerHTML = '<option value="">Select an Organization</option>';

  allOrganizations.forEach((org) => {
    const option = document.createElement("option");
    option.value = org.organization_id;
    option.textContent = org.organization_name;
    orgSelect.appendChild(option);
  });

  if (currentValue) {
    orgSelect.value = currentValue;
  }
}

function handleDealCreate(form) {
  if (!dbWorker) {
    console.error("Database worker not available");
    return;
  }

  console.log("Inside handle Deal create caller");

  const dealName = document.getElementById("deal_name")?.value?.trim() || "";
  const dealValue = document.getElementById("deal_value")?.value?.trim() || "";
  const leadId = document.getElementById("lead_id")?.value || "";
  const organizationId =
    document.getElementById("organization_id")?.value || "";
  const dealStatus =
    document.getElementById("deal_status")?.value?.trim() || "";

  if (!dealName || !dealValue) {
    alert("Please fill in Deal Name and Deal Value");
    return;
  }

  if (!dealStatus) {
    alert("Please select a Deal Status");
    return;
  }

  const dealData = {
    deal_id: Date.now(),
    deal_name: dealName,
    deal_value: Number(dealValue),
    lead_id: leadId ? leadId : null,
    organization_id: organizationId ? organizationId : null,
    deal_status: dealStatus,
    created_on: new Date(),
    modified_on: new Date(),
  };

  if (leadId) {
    const lead = allLeads.find((l) => l.lead_id === dealData.lead_id);
    if (lead) {
      dealData.lead_first_name = lead.lead_first_name;
      dealData.lead_last_name = lead.lead_last_name;
    }
  }

  if (organizationId) {
    const org = allOrganizations.find(
      (o) => o.organization_id === dealData.organization_id,
    );
    if (org) {
      dealData.organization_name = org.organization_name;
    }
  }

  const messageHandler = (e) => {
    const { action, error, storeName } = e.data;

    if (action === "insertSuccess" && storeName === "Deals") {
      dbWorker.removeEventListener("message", messageHandler);
      alert("Deal created successfully!");
      form.reset();
      document.getElementById("form-modal")?.classList.add("hidden");
      loadAllDeals();
    } else if (action === "insertError" && storeName === "Deals") {
      dbWorker.removeEventListener("message", messageHandler);
      alert("Error creating deal: " + error);
    }
  };

  // dbWorker.addEventListener("message", messageHandler);
  dbWorker.postMessage({
    action: "createDeal",
    dealData,
    storeName: "Deals",
  });

  // Safety timeout to remove listener if no response
  setTimeout(() => {
    dbWorker.removeEventListener("message", messageHandler);
  }, 5000);
}

// function handleEditDeal(e) {
//   const editBtn = e.target.closest("#editDeal");
//   const dealRow = editBtn.closest("tr");
//   const deal_id = dealRow?.getAttribute("data-deal-id");

//   if (deal_id) {
//     sessionStorage.setItem("deal_id", deal_id);

//     const dropdown = editBtn.closest(".dropdown-menu");
//     if (dropdown) {
//       dropdown.classList.add("hidden");
//     }
//   }
// }

function handleDeleteDeal(e) {
  const deleteBtn = e.target.closest("#deleteDeal");
  const dealRow = deleteBtn.closest("tr");
  const deal_id = dealRow?.getAttribute("data-deal-id");

  if (deal_id) {
    if (confirm("Are you sure you want to delete this deal?")) {
      if (!dbWorker) {
        console.error("Database worker not available");
        return;
      }

      const messageHandler = (e) => {
        const { action, error, storeName } = e.data;

        if (action === "deleteSuccess" && storeName === "Deals") {
          dbWorker.removeEventListener("message", messageHandler);
          alert("Deal deleted successfully!");
          loadAllDeals();
        } else if (action === "deleteError" && storeName === "Deals") {
          dbWorker.removeEventListener("message", messageHandler);
          alert("Error deleting deal: " + error);
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "deleteDeal",
        id: deal_id,
        storeName: "Deals",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
      }, 5000);
    }
  }

  const dropdown = deleteBtn.closest(".dropdown-menu");
  if (dropdown) {
    dropdown.classList.add("hidden");
  }
}
