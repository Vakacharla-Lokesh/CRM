import { dbState } from "../../services/state/dbState.js";
import { showNotification } from "../notificationEvents.js";

export function handleUserCreate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const userData = {
    ...event.detail.userData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbWorker.postMessage({
    action: "createUser",
    userData,
    storeName: "Users",
  });
}

export function handleUserCreated(event) {
  showNotification("User created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/users" && dbWorker) {
    const user = JSON.parse(localStorage.getItem("user"));
    dbWorker.postMessage({
      action: "getAllUsers",
      tenant_id: user.tenant_id,
      role: user.role,
    });
  }
}

export function handleUserDelete(event) {
  const { dbWorker } = dbState;

  if (!dbWorker) return;

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteUser", id, storeName: "Users" });
}

export function handleUserDeleted(event) {
  showNotification("User deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/users" && dbWorker) {
    const user = JSON.parse(localStorage.getItem("user"));
    dbWorker.postMessage({
      action: "getAllUsers",
      tenant_id: user.tenant_id,
      role: user.role,
    });
  }
}

export function handleUserClick(e) {
  if (e.target.closest("#deleteUser")) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const deleteBtn = e.target.closest("#deleteUser");
    const userRow = deleteBtn.closest("tr");
    const user_id = userRow?.getAttribute("data-user-id");

    if (user_id) {
      if (confirm("Are you sure you want to delete this user?")) {
        import("../eventBus.js").then(({ eventBus, EVENTS }) => {
          eventBus.emit(EVENTS.USER_DELETE, { id: user_id });
        });
      }
    }

    return true;
  }

  return false;
}
