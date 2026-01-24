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

export function handleOrganizationCreated(event) {
  showNotification("Organization created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/organizations" && dbWorker) {
    dbWorker.postMessage({ action: "getAllOrganizations" });
  }
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
    dbWorker.postMessage({ action: "getAllOrganizations" });
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

    sessionStorage.setItem("organization_id", organization_id);

    const modal = document.getElementById("form-modal");
    if (modal) {
      modal.classList.remove("hidden");
    }

    dbWorker.postMessage({
      action: "getOrganizationById",
      id: organization_id,
    });

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
