export function getAllData(storeName, dbReady, db) {
  // console.log("getAllData called for:", storeName, "dbReady:", dbReady);

  if (!dbReady || !db) {
    console.error("Database not ready");
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
      console.log("getAllData success, count:", request.result.length);
      postMessage({
        action: "getAllSuccess",
        rows: request.result,
        storeName,
      });
    };

    request.onerror = (e) => {
      console.error("getAllData error:", e.target.error);
      postMessage({
        action: "getAllError",
        error: e.target.error?.message || "Fetch failed",
        storeName,
      });
    };
  } catch (error) {
    console.error("Transaction error:", error);
    postMessage({
      action: "getAllError",
      error: error.message,
      storeName,
    });
  }
}

export function getDataById(storeName, id, dbReady, db) {
  if (!dbReady || !db) {
    postMessage({
      action: "getError",
      error: "Database not ready",
    });
    return;
  }

  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const request = store.get(id);

  try {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      postMessage({
        action: "getByIdSuccess",
        storeName,
        data: request.result,
        id,
      });
    };

    request.onerror = (e) => {
      postMessage({
        action: "getByIdError",
        error: e.target.error?.message,
        id,
      });
    };
  } catch (error) {
    postMessage({
      action: "getByIdError",
      error: error.message,
      id,
    });
  }
}
