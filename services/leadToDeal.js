import { generateId } from "./utils/uidGenerator.js";

export function convertLeadToDeal(leadId, dbReady, db) {
  if (!dbReady || !db) {
    postMessage({
      action: "convertToDealError",
      error: "Database not ready",
    });
    return;
  }

  console.log("Converting lead:", leadId);

  try {
    const tx = db.transaction(["Leads", "Deals"], "readwrite");
    const leadsStore = tx.objectStore("Leads");
    const dealsStore = tx.objectStore("Deals");

    const getRequest = leadsStore.get(leadId);

    getRequest.onsuccess = () => {
      const lead = getRequest.result;

      console.log("Lead data retrieved:", lead);

      if (!lead) {
        postMessage({
          action: "convertToDealError",
          error: "Lead not found",
        });
        return;
      }

      const dealData = {
        deal_id: generateId("deal"),
        deal_name: `Deal - ${lead.lead_first_name} ${lead.lead_last_name}`,
        deal_value: 0,
        lead_id: lead.lead_id,
        lead_first_name: lead.lead_first_name,
        lead_last_name: lead.lead_last_name,
        organization_id: lead.organization_id || null,
        organization_name: lead.organization_name || "",
        tenant_id: lead.tenant_id,
        user_id: lead.user_id,
        deal_status: "Prospecting",
        created_on: new Date(),
        modified_on: new Date(),
      };

      console.log("Deal data to create:", dealData);

      const addRequest = dealsStore.add(dealData);

      addRequest.onsuccess = () => {
        console.log("Deal created successfully");
        const updatedLead = {
          ...lead,
          lead_status: "Converted",
          modified_on: new Date(),
        };

        const updateRequest = leadsStore.put(updatedLead);

        updateRequest.onsuccess = () => {
          console.log("Lead status updated to Converted");
          postMessage({
            action: "convertToDealSuccess",
            dealData,
            leadId,
          });
        };

        updateRequest.onerror = (e) => {
          console.error("Error updating lead status:", e.target.error);
          postMessage({
            action: "convertToDealError",
            error: e.target.error?.message || "Failed to update lead status",
          });
        };
      };

      addRequest.onerror = (e) => {
        console.error("Error creating deal:", e.target.error);
        postMessage({
          action: "convertToDealError",
          error: e.target.error?.message || "Failed to create deal",
        });
      };
    };

    getRequest.onerror = (e) => {
      console.error("Error fetching lead:", e.target.error);
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
