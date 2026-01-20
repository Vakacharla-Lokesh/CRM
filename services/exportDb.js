export function exportToJson(idbDatabase) {
  return new Promise((resolve, reject) => {
    const exportObject = {};
    if (idbDatabase.objectStoreNames.length === 0) {
      resolve(JSON.stringify(exportObject));
    } else {
      const transaction = idbDatabase.transaction(
        idbDatabase.objectStoreNames,
        "readonly",
      );

      transaction.addEventListener("error", reject);

      for (const storeName of idbDatabase.objectStoreNames) {
        const allObjects = [];
        transaction
          .objectStore(storeName)
          .openCursor()
          .addEventListener("success", (event) => {
            const cursor = event.target.result;
            if (cursor) {
              // Cursor holds value, put it into store data
              allObjects.push(cursor.value);
              cursor.continue();
            } else {
              // No more values, store is done
              exportObject[storeName] = allObjects;

              // Last store was handled
              if (
                idbDatabase.objectStoreNames.length ===
                Object.keys(exportObject).length
              ) {
                resolve(JSON.stringify(exportObject));
              }
            }
          });
      }
    }
  });
}

export function exportDb() {
  console.log("Inside exportdb fn ...");
  const dbName = "CRM_DB";
  indexedDB.open(dbName).onsuccess = function (event) {
    const db = event.target.result;
    exportToJson(db)
      .then((jsonData) => {
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "indexeddb_backup.json";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => console.error("Export failed:", err));
  };
}
