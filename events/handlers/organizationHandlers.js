import { dbState } from "../../services/dbState.js";
import { showNotification } from "../notificationEvents.js";
import { exportDb } from "../../services/exportDb.js";
import { generateId } from "../../services/uidGenerator.js";

export function handleOrganizationCreate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const organizationData = {
    organization_id: generateId("org"),
    ...event.detail.organizationData,
    created_on: new Date(),
    modified_on: new Date(),
  };

  dbWorker.postMessage({
    action: "createOrganization",
    organizationData,
  });
}

export function handleOrganizationUpdate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const organizationData = {
    ...event.detail.organizationData,
    modified_on: new Date(),
  };

  dbWorker.postMessage({
    action: "updateOrganization",
    organizationData,
    storeName: "Organizations",
  });
}

export function handleOrganizationCreated(event) {
  showNotification("Organization created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/organizations" && dbWorker) {
    const user = JSON.parse(localStorage.getItem("user"));
    dbWorker.postMessage({
      action: "getAllOrganizations",
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      role: user.role,
    });
  }
}

export function handleOrganizationUpdated(event) {
  showNotification("Organization updated successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/organizations" && dbWorker) {
    const user = JSON.parse(localStorage.getItem("user"));
    dbWorker.postMessage({
      action: "getAllOrganizations",
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      role: user.role,
    });
  }
  
  sessionStorage.removeItem("organization_id");
}

export function handleOrganizationDelete(event) {
  const { dbWorker } = dbState;

  if (!dbWorker) return;

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteOrganization", id });
}

export function handleOrganizationDeleted(event) {
  showNotification("Organization deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/organizations" && dbWorker) {
    const user = JSON.parse(localStorage.getItem("user"));
    dbWorker.postMessage({
      action: "getAllOrganizations",
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      role: user.role,
    });
  }
}

export function handleOrganizationExport() {
  exportDb("Organizations");
}

// Click handler for organization actions
export function handleOrganizationClick(e) {
  const { dbWorker } = dbState;

  if (e.target.closest("#editOrganization")) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const editBtn = e.target.closest("#editOrganization");
    const organizationRow = editBtn.closest("tr");
    const organization_id = organizationRow?.getAttribute(
      "data-organization-id",
    );

    if (organization_id) {
      // Set the organization_id in session storage
      sessionStorage.setItem("organization_id", organization_id);

      // Open the modal
      const modal = document.getElementById("form-modal");
      if (modal) {
        modal.classList.remove("hidden");

        // Request organization data from DB
        if (dbWorker) {
          dbWorker.postMessage({
            action: "getOrganizationById",
            id: organization_id,
            storeName: "Organizations",
          });
        }
      }
    }

    const dropdown = editBtn.closest(".dropdown-menu");
    if (dropdown) {
      dropdown.classList.add("hidden");
    }
    return true;
  }

  if (e.target.closest("#deleteOrganization")) {
    e.stopImmediatePropagation();
    e.preventDefault();

    const deleteBtn = e.target.closest("#deleteOrganization");
    const organizationRow = deleteBtn.closest("tr");
    const organization_id = organizationRow?.getAttribute(
      "data-organization-id",
    );

    if (organization_id) {
      if (confirm("Are you sure you want to delete this organization?")) {
        import("../eventBus.js").then(({ eventBus, EVENTS }) => {
          eventBus.emit(EVENTS.ORGANIZATION_DELETE, { id: organization_id });
        });
      }
    }

    const dropdown = deleteBtn.closest(".dropdown-menu");
    if (dropdown) {
      dropdown.classList.add("hidden");
    }
    return true;
  }

  return false;
}
