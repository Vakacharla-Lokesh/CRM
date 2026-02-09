import { dbState } from "../../services/state/dbState.js";
import { showNotification } from "../notificationEvents.js";
import userManager from "./userManager.js";
import { apiClient, API_ENDPOINTS } from "../../services/api/apiClient.js";
import { eventBus, EVENTS } from "../eventBus.js";

export async function handleUserCreate(event) {
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

  try {
    // Make API call first
    await apiClient.post(API_ENDPOINTS.USERS.CREATE, userData);
    
    // Then sync to IndexedDB
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Users",
      operation: "insert",
      data: userData,
    });
    
    eventBus.emit(EVENTS.USER_CREATED);
  } catch (error) {
    console.error("Failed to create user:", error);
    showNotification("Failed to create user: " + error.message, "error");
    
    // Still try to save locally
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Users",
      operation: "insert",
      data: userData,
    });
  }
}

export async function handleUserCreated(event) {
  showNotification("User created successfully!", "success");

  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  if (currentTab === "/users" && dbWorker) {
    const user = userManager.getUser();
    if (!user) return;
    const { tenant_id, role } = user;
    
    try {
      // Fetch fresh data from API
      const response = await apiClient.get(API_ENDPOINTS.USERS.GET_ALL);
      const usersData = response.data || response;

      // Filter by tenant
      const filteredUsers = usersData.filter(
        (u) => String(u.tenant_id) === String(tenant_id)
      );

      // Sync to IndexedDB
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Users",
        operation: "replaceAll",
        data: filteredUsers,
      });

      // Emit data fetched event for UI update
      eventBus.emit(EVENTS.DATA_FETCHED, {
        storeName: "Users",
        rows: filteredUsers,
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Fallback to IndexedDB
      dbWorker.postMessage({
        action: "getData",
        storeName: "Users",
        filters: { tenant_id, role },
      });
    }
  }
}

export async function handleUserDelete(event) {
  const { dbWorker } = dbState;

  if (!dbWorker) return;

  const id = event.detail.id;
  
  try {
    // Delete from API first
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
    
    // Then delete from IndexedDB
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Users",
      operation: "delete",
      id: id,
    });
    
    eventBus.emit(EVENTS.USER_DELETED);
  } catch (error) {
    console.error("Failed to delete user:", error);
    showNotification("Failed to delete user: " + error.message, "error");
    
    // Still try to delete locally
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Users",
      operation: "delete",
      id: id,
    });
  }
}

export async function handleUserDeleted(event) {
  showNotification("User deleted successfully!", "success");

  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  if (currentTab === "/users" && dbWorker) {
    const user = userManager.getUser();
    if (!user) return;
    const { tenant_id, role } = user;
    
    try {
      // Fetch fresh data from API
      const response = await apiClient.get(API_ENDPOINTS.USERS.GET_ALL);
      const usersData = response.data || response;

      // Filter by tenant
      const filteredUsers = usersData.filter(
        (u) => String(u.tenant_id) === String(tenant_id)
      );

      // Sync to IndexedDB
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Users",
        operation: "replaceAll",
        data: filteredUsers,
      });

      // Emit data fetched event for UI update
      eventBus.emit(EVENTS.DATA_FETCHED, {
        storeName: "Users",
        rows: filteredUsers,
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Fallback to IndexedDB
      dbWorker.postMessage({
        action: "getData",
        storeName: "Users",
        filters: { tenant_id, role },
      });
    }
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
