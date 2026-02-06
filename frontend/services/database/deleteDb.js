export function deleteData(id, storeName, dbReady, db) {
  if (!dbReady || !db) {
    postMessage({
      action: "deleteError",
      error: "Database not ready",
    });
    return;
  }

  try {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    // console.log(id);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log("Delete successful");
      postMessage({ action: "deleteSuccess", id, storeName });
    };

    request.onerror = (e) => {
      console.error("Delete error:", e.target.error);
      postMessage({
        action: "deleteError",
        error: e.target.error?.message || "Delete failed",
      });
    };
  } catch (error) {
    console.error("Transaction error:", error);
    postMessage({
      action: "insertError",
      error: error.message,
    });
  }
}
