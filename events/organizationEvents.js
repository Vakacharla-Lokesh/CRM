export function handleOrganizationCreate(event) {
  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const organizationData = {
    organization_id: Date.now(),
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
  if (currentTab === "/organizations" && dbWorker) {
    dbWorker.postMessage({ action: "getAllOrganizations" });
  }
}

export function handleOrganizationDelete(event) {
  if (!dbWorker) return;

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteOrganization", id });
}

export function handleOrganizationDeleted(event) {
  showNotification("Organization deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/organizations" && dbWorker) {
    dbWorker.postMessage({ action: "getAllOrganizations" });
  }
}
