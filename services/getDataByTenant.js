export function getDataByTenantAndUser(storeName, user_id, tenant_id, role, dbReady, db) {
  if (!dbReady || !db) {
    postMessage({
      action: "getAllError",
      error: "Database not ready",
      storeName,
    });
    return;
  }

  try {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      let filteredData = request.result;
      if (role === "super_admin") {
        postMessage({
          action: "getAllSuccess",
          rows: filteredData,
          storeName,
        });
        return;
      }
      if (role === "admin") {
        filteredData = filteredData.filter(item => item.tenant_id === tenant_id);
        postMessage({
          action: "getAllSuccess",
          rows: filteredData,
          storeName,
        });
        return;
      }
      filteredData = filteredData.filter(item => 
        item.user_id === user_id && item.tenant_id === tenant_id
      );
      postMessage({
        action: "getAllSuccess",
        rows: filteredData,
        storeName,
      });
    };

    request.onerror = (e) => {
      postMessage({
        action: "getAllError",
        error: e.target.error?.message || "Fetch failed",
        storeName,
      });
    };
  } catch (error) {
    postMessage({
      action: "getAllError",
      error: error.message,
      storeName,
    });
  }
}