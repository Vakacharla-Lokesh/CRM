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
    postMessage({ action: "putSuccess", data: data });
  };

  request.onerror = (e) => {
    postMessage({
      action: "putError",
      error: e.target.error?.message,
    });
  };
}