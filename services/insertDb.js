export function insertData(data, storeName, dbReady, db) {
  if (!dbReady || !db) {
    postMessage({
      action: "insertError",
      error: "Database not ready",
    });
    return;
  }

  try {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => {
      // console.log("Insert successful");
      postMessage({ action: "insertSuccess", data: data });
    };

    request.onerror = (e) => {
      console.error("Insert error:", e.target.error);
      postMessage({
        action: "insertError",
        error: e.target.error?.message || "Insert failed",
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