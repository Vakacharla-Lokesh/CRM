const objectKeys = {
  Leads: "lead_id",
  Organizations: "organization_id",
  Deals: "deal_id",
  Tenants: "tenant_id",
};

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
              allObjects.push(cursor.value);
              cursor.continue();
            } else {
              exportObject[storeName] = allObjects;
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

export function exportDb(storeName) {
  console.log("Inside exportdb fn ...");
  const dbName = "CRM_DB";
  indexedDB.open(dbName).onsuccess = function (event) {
    const db = event.target.result;
    exportStoreToCsv(db, storeName)
      .then((jsonData) => {
        const blob = new Blob([jsonData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "indexeddb_backup.csv";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => console.error("Export failed:", err));
  };
}

export function downloadCsvFromData(storeName, data) {
  const objectKeys = {
    Leads: "lead_id",
    Organizations: "organization_id",
    Deals: "deal_id",
    Tenants: "tenant_id",
  };

  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const idKey = objectKeys[storeName];
  
  const headers = Array.from(
    new Set(
      data.flatMap((obj) =>
        Object.keys(obj).filter((key) => key !== idKey),
      ),
    ),
  );

  const escapeCsv = (value) => {
    if (value == null) return "";
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => escapeCsv(row[h])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${storeName}_export.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportStoreToJson(db, storeName) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(storeName)) {
      reject(new Error(`Object store "${storeName}" does not exist`));
      return;
    }

    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.openCursor();

    const allObjects = [];

    request.onerror = () => reject(request.error);

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        allObjects.push(cursor.value);
        cursor.continue();
      } else {
        resolve(JSON.stringify({ [storeName]: allObjects }, null, 2));
      }
    };
  });
}

export function exportStoreToCsv(db, storeName) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(storeName)) {
      reject(new Error(`Object store "${storeName}" does not exist`));
      return;
    }

    const idKey = objectKeys[storeName];

    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.openCursor();

    const rows = [];

    request.onerror = () => reject(request.error);

    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        rows.push(cursor.value);
        cursor.continue();
      } else {
        if (!rows.length) {
          resolve("");
          return;
        }
        const headers = Array.from(
          new Set(
            rows.flatMap((obj) =>
              Object.keys(obj).filter((key) => key !== idKey),
            ),
          ),
        );

        const escapeCsv = (value) => {
          if (value == null) return "";
          const str = String(value);
          return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
        };

        const csv = [
          headers.join(","),
          ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(",")),
        ].join("\n");

        resolve(csv);
      }
    };
  });
}
