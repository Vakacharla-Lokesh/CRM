export function convertLeadToDeal(leadId, dbReady, db) {
  if (!dbReady || !db) {
    postMessage({
      action: "convertToDealError",
      error: "Database not ready",
    });
    return;
  }

  try {
    // First, get the lead data
    const tx = db.transaction(["Leads", "Deals"], "readwrite");
    const leadsStore = tx.objectStore("Leads");
    const dealsStore = tx.objectStore("Deals");

    const getRequest = leadsStore.get(leadId);

    getRequest.onsuccess = () => {
      const lead = getRequest.result;

      if (!lead) {
        postMessage({
          action: "convertToDealError",
          error: "Lead not found",
        });
        return;
      }

      // Create deal from lead data
      const dealData = {
        deal_id: generateId("deal"),
        deal_name: `Deal - ${lead.lead_first_name} ${lead.lead_last_name}`,
        deal_value: 0, // Default value, user can update later
        lead_id: lead.lead_id,
        lead_first_name: lead.lead_first_name,
        lead_last_name: lead.lead_last_name,
        organization_id: lead.organization_id || null,
        organization_name: lead.organization_name || "",
        deal_status: "Prospecting",
        created_on: new Date(),
        modified_on: new Date(),
      };

      const addRequest = dealsStore.add(dealData);

      addRequest.onsuccess = () => {
        // Update lead status to "Converted"
        const updatedLead = {
          ...lead,
          lead_status: "Converted",
          modified_on: new Date(),
        };

        const updateRequest = leadsStore.put(updatedLead);

        updateRequest.onsuccess = () => {
          postMessage({
            action: "convertToDealSuccess",
            dealData,
            leadId,
          });
        };

        updateRequest.onerror = (e) => {
          postMessage({
            action: "convertToDealError",
            error: e.target.error?.message || "Failed to update lead status",
          });
        };
      };

      addRequest.onerror = (e) => {
        postMessage({
          action: "convertToDealError",
          error: e.target.error?.message || "Failed to create deal",
        });
      };
    };

    getRequest.onerror = (e) => {
      postMessage({
        action: "convertToDealError",
        error: e.target.error?.message || "Failed to fetch lead",
      });
    };
  } catch (error) {
    console.error("Convert to deal error:", error);
    postMessage({
      action: "convertToDealError",
      error: error.message,
    });
  }
}

// Add this helper function for ID generation in worker
function generateId(prefix) {
  return (
    prefix + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
}
