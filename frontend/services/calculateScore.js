function scoreLead(lead) {
  let score = 0;
  score += (lead.comments || 0) * 4;

  if (lead.organization_size >= 100) score += 10;
  if (lead.organization_size >= 500) score += 10;

  if (
    lead.lead_email &&
    !lead.lead_email.includes("gmail.com") &&
    !lead.lead_email.includes("hotmail.com")
  ) {
    score += 5;
  }

  score += (lead.calls || 0) * 3;

  score += (lead.attachments || 0) * 2;

  if (lead.lead_status === "Converted") {
    score += 20;
  } else if (lead.lead_status === "Follow-Up") {
    score += 10;
  } else if (lead.lead_status === "Dead") {
    score = Math.max(0, score - 15);
  }

  if (lead.created_on) {
    const daysSinceCreation =
      (Date.now() - new Date(lead.created_on).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 30) {
      score += 5;
    }
  }

  return Math.max(0, score);
}

function canUpdateLead(lead, user_id, tenant_id, role) {
  if (role === "super_admin") return true;

  if (role === "admin") {
    return lead.tenant_id === tenant_id;
  }

  if (role === "user") {
    return lead.user_id === user_id;
  }

  return false;
}

export function updateAllObjects(db, dbReady, user_id, tenant_id, role) {
  if (!dbReady || !db) {
    console.error("Database not ready");
    postMessage({
      action: "scoreUpdateError",
      error: "Database not ready",
    });
    return;
  }

  console.log("Starting lead score calculation...");

  const leadsTransaction = db.transaction(
    ["Leads", "Comments", "Calls", "Attachments"],
    "readonly",
  );
  const leadsStore = leadsTransaction.objectStore("Leads");
  const commentsStore = leadsTransaction.objectStore("Comments");
  const callsStore = leadsTransaction.objectStore("Calls");
  const attachmentsStore = leadsTransaction.objectStore("Attachments");

  const leadsRequest = leadsStore.getAll();

  leadsRequest.onsuccess = function () {
    const allLeads = leadsRequest.result;

    const leads = allLeads.filter((lead) =>
      canUpdateLead(lead, user_id, tenant_id, role),
    );

    const commentsRequest = commentsStore.getAll();
    const callsRequest = callsStore.getAll();
    const attachmentsRequest = attachmentsStore.getAll();

    Promise.all([
      new Promise((resolve) => {
        commentsRequest.onsuccess = () => resolve(commentsRequest.result);
      }),
      new Promise((resolve) => {
        callsRequest.onsuccess = () => resolve(callsRequest.result);
      }),
      new Promise((resolve) => {
        attachmentsRequest.onsuccess = () => resolve(attachmentsRequest.result);
      }),
    ]).then(([allComments, allCalls, allAttachments]) => {
      const commentCounts = {};
      const callCounts = {};
      const attachmentCounts = {};

      allComments.forEach((comment) => {
        commentCounts[comment.lead_id] =
          (commentCounts[comment.lead_id] || 0) + 1;
      });

      allCalls.forEach((call) => {
        callCounts[call.lead_id] = (callCounts[call.lead_id] || 0) + 1;
      });

      allAttachments.forEach((attachment) => {
        attachmentCounts[attachment.lead_id] =
          (attachmentCounts[attachment.lead_id] || 0) + 1;
      });

      const updateTransaction = db.transaction("Leads", "readwrite");
      const updateStore = updateTransaction.objectStore("Leads");

      let updatedCount = 0;
      let errorCount = 0;

      leads.forEach((lead) => {
        const enrichedLead = {
          ...lead,
          comments: commentCounts[lead.lead_id] || 0,
          calls: callCounts[lead.lead_id] || 0,
          attachments: attachmentCounts[lead.lead_id] || 0,
        };
        const newScore = scoreLead(enrichedLead);
        if (lead.score !== newScore) {
          const updatedLead = {
            ...lead,
            score: newScore,
            modified_on: new Date(),
          };

          const updateRequest = updateStore.put(updatedLead);

          updateRequest.onsuccess = () => {
            updatedCount++;
            console.log(
              `Updated lead ${lead.lead_id}: score ${lead.score || 0} to ${newScore}`,
            );
          };

          updateRequest.onerror = (e) => {
            errorCount++;
            console.error(
              `Error updating lead ${lead.lead_id}:`,
              e.target.error,
            );
          };
        }
      });

      updateTransaction.oncomplete = () => {
        console.log(
          `Score calculation complete. Updated: ${updatedCount}, Errors: ${errorCount}`,
        );
        postMessage({
          action: "scoreUpdateSuccess",
          updatedCount,
          errorCount,
          totalLeads: leads.length,
        });
      };

      updateTransaction.onerror = (e) => {
        console.error("Transaction error:", e.target.error);
        postMessage({
          action: "scoreUpdateError",
          error: e.target.error?.message || "Update failed",
        });
      };
    });
  };

  leadsRequest.onerror = (e) => {
    console.error("Error fetching leads:", e.target.error);
    postMessage({
      action: "scoreUpdateError",
      error: e.target.error?.message || "Failed to fetch leads",
    });
  };
}
