import { dbState } from "../../services/state/dbState.js";
import { showNotification } from "../notificationEvents.js";
import { generateId } from "../../services/utils/uidGenerator.js";

export function handleTenantCreate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const {
    tenant_name,
    admin_first_name,
    admin_last_name,
    admin_email,
    admin_mobile,
    admin_password,
  } = event.detail.tenantData;

  // Generate unique IDs
  const tenant_id = generateId("tenant");
  const user_id = generateId("user");

  // Create tenant data
  const tenantData = {
    tenant_id,
    tenant_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Create admin user data
  const adminData = {
    user_id,
    user_email: admin_email,
    password: admin_password,
    first_name: admin_first_name,
    last_name: admin_last_name,
    mobile: admin_mobile || "",
    role: "admin",
    tenant_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Send message to create tenant and admin
  dbWorker.postMessage({
    action: "createTenantWithAdmin",
    tenantData,
    adminData,
  });
}

export function handleTenantCreated(event) {
  showNotification("Tenant created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/tenants" && dbWorker) {
    dbWorker.postMessage({ action: "getAllTenants" });
    dbWorker.postMessage({ action: "getAllUsers" });
  }
}

export function handleTenantUpdate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const tenantData = {
    ...event.detail.tenantData,
    updated_at: new Date().toISOString(),
  };

  dbWorker.postMessage({
    action: "updateTenant",
    tenantData,
  });
}

export function handleTenantUpdated(event) {
  showNotification("Tenant updated successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/tenants" && dbWorker) {
    dbWorker.postMessage({ action: "getAllTenants" });
    dbWorker.postMessage({ action: "getAllUsers" });
  }
}

export function handleTenantDelete(event) {
  const { dbWorker } = dbState;

  if (!dbWorker) return;

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteTenant", id });
}

export function handleTenantDeleted(event) {
  showNotification("Tenant deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/tenants" && dbWorker) {
    dbWorker.postMessage({ action: "getAllTenants" });
    dbWorker.postMessage({ action: "getAllUsers" });
  }
}

export function handleTenantClick(e) {
  const { dbWorker } = dbState;

  if (e.target.closest("#editTenant")) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const editBtn = e.target.closest("#editTenant");
    const tenantRow = editBtn.closest("tr");
    const tenant_id = tenantRow?.getAttribute("data-tenant-id");

    if (tenant_id && dbWorker) {
      dbWorker.postMessage({ action: "getTenantById", id: tenant_id });
    }
    return true;
  }

  if (e.target.closest("#deleteTenant")) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const deleteBtn = e.target.closest("#deleteTenant");
    const tenantRow = deleteBtn.closest("tr");
    const tenant_id = tenantRow?.getAttribute("data-tenant-id");

    if (!tenant_id) return;

    if (
      confirm(
        "Are you sure you want to delete this tenant? This will also delete all associated users, leads, deals, and organizations.",
      )
    ) {
      const event = new CustomEvent("tenant:delete", {
        detail: { id: tenant_id },
        bubbles: true,
        composed: true,
      });
      document.dispatchEvent(event);
    }
    return true;
  }
}

export function handleBulkDeleteTenants() {
  const checkboxes = document.querySelectorAll(
    "#tenants-table .item-checkbox:checked",
  );

  if (checkboxes.length === 0) {
    showNotification("Please select tenants to delete", "warning");
    return;
  }

  if (
    !confirm(
      `Are you sure you want to delete ${checkboxes.length} tenant(s)? This will also delete all associated data.`,
    )
  ) {
    return;
  }

  const { dbWorker } = dbState;
  if (!dbWorker) return;

  checkboxes.forEach((checkbox) => {
    const tenant_id = checkbox.value;
    dbWorker.postMessage({ action: "deleteTenant", id: tenant_id });
  });
}

export function handleSelectAllTenants(e) {
  const isChecked = e.target.checked;
  const checkboxes = document.querySelectorAll("#tenants-table .item-checkbox");
  const bulkDeleteBtn = document.getElementById("bulk-delete-tenants");

  checkboxes.forEach((checkbox) => {
    checkbox.checked = isChecked;
  });

  if (bulkDeleteBtn) {
    bulkDeleteBtn.style.display = isChecked ? "flex" : "none";
  }
}

export function handleTenantCheckboxChange() {
  const checkboxes = document.querySelectorAll("#tenants-table .item-checkbox");
  const checkedBoxes = document.querySelectorAll(
    "#tenants-table .item-checkbox:checked",
  );
  const selectAllCheckbox = document.getElementById("select-all-tenants");
  const bulkDeleteBtn = document.getElementById("bulk-delete-tenants");

  if (selectAllCheckbox) {
    selectAllCheckbox.checked = checkboxes.length === checkedBoxes.length;
  }

  if (bulkDeleteBtn) {
    bulkDeleteBtn.style.display = checkedBoxes.length > 0 ? "flex" : "none";
  }
}

export function openTenantModalForEdit(tenantData) {
  const modal = document.querySelector("tenant-modal");
  if (modal) {
    modal.open(tenantData);
  }
}
