export function updateData(storeName, data, dbReady, db) {
  if (!dbReady || !db) {
    postMessage({
      action: "updateError",
      error: "Database not ready",
    });
    return;
  }

  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const request = store.put(data);

  request.onsuccess = () => {
    // console.log("update success");
    postMessage({ action: "updateSuccess", id: data.lead_id });
  };

  request.onerror = (e) => {
    postMessage({
      action: "updateError",
      error: e.target.error?.message,
    });
  };
}
