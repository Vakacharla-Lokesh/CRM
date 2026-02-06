export function getLeadById(leadId, dbWorker) {
  return new Promise((resolve, reject) => {
    if (!dbWorker) {
      reject(new Error("Database worker not available"));
      return;
    }

    const messageHandler = (e) => {
      const { action, data, error, id } = e.data;

      if (action === "getByIdSuccess" && id == leadId) {
        dbWorker.removeEventListener("message", messageHandler);
        resolve(data);
      } else if (action === "getByIdError" && id == leadId) {
        dbWorker.removeEventListener("message", messageHandler);
        reject(new Error(error || "Failed to fetch lead"));
      }
    };

    dbWorker.addEventListener("message", messageHandler);
    dbWorker.postMessage({
      action: "getLeadById",
      storeName: "Leads",
      id: leadId,
    });

    setTimeout(() => {
      dbWorker.removeEventListener("message", messageHandler);
      reject(new Error("Request timeout"));
    }, 5000);
  });
}
