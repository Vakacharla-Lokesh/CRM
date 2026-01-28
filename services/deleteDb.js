export function deleteData(id, storeName, dbReady, db) {
  if (!dbReady || !db) {
    postMessage({
      action: "deleteError",
      error: "Database not ready",
    });
    return;
  }

  try {
    // If deleting a lead, cascade delete related records
    if (storeName === "Leads") {
      cascadeDeleteLead(id, db);
    } else {
      // Normal delete for other stores
      performDelete(id, storeName, db);
    }
  } catch (error) {
    console.error("Transaction error:", error);
    postMessage({
      action: "deleteError",
      error: error.message,
      storeName,
    });
  }
}

function cascadeDeleteLead(leadId, db) {
  try {
    // Create a transaction for all related stores
    const tx = db.transaction(
      ["Leads", "Attachments", "Calls", "Comments"],
      "readwrite",
    );

    // Delete from Leads
    const leadsStore = tx.objectStore("Leads");
    leadsStore.delete(leadId);

    // Delete related attachments
    const attachmentsStore = tx.objectStore("Attachments");
    const attachmentsIndex = attachmentsStore.index ? null : attachmentsStore;
    const attachmentRequest = attachmentsStore.openCursor();

    attachmentRequest.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.lead_id == leadId) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    // Delete related calls
    const callsStore = tx.objectStore("Calls");
    const callsRequest = callsStore.openCursor();

    callsRequest.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.lead_id == leadId) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    // Delete related comments
    const commentsStore = tx.objectStore("Comments");
    const commentsRequest = commentsStore.openCursor();

    commentsRequest.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.lead_id == leadId) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    tx.oncomplete = () => {
      console.log("Cascade delete successful for lead:", leadId);
      postMessage({
        action: "deleteSuccess",
        id: leadId,
        storeName: "Leads",
        cascaded: true,
      });
    };

    tx.onerror = (e) => {
      console.error("Cascade delete error:", e.target.error);
      postMessage({
        action: "deleteError",
        error: e.target.error?.message || "Cascade delete failed",
        storeName: "Leads",
      });
    };
  } catch (error) {
    console.error("Cascade delete error:", error);
    postMessage({
      action: "deleteError",
      error: error.message,
      storeName: "Leads",
    });
  }
}

function performDelete(id, storeName, db) {
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
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
      storeName,
    });
  };
}
