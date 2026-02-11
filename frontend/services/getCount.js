import {
  buildIndustrySegmentMap,
  buildStatusSegmentMap,
  mapToArray,
} from "./data/leadSegmentation.js";

export function getCount(db, dbReady, tenantId, userId, role, metadata = {}) {
  if (!dbReady || !db) {
    postMessage({
      action: "getDataError",
      error: "Database not ready",
    });
    return;
  }

  try {
    const leadsTx = db.transaction("Leads", "readonly");
    const leadsStore = leadsTx.objectStore("Leads");
    const leadsReq = leadsStore.getAll();

    const dealsTx = db.transaction("Deals", "readonly");
    const dealsStore = dealsTx.objectStore("Deals");
    const dealsReq = dealsStore.getAll();

    leadsReq.onerror = dealsReq.onerror = (e) => {
      postMessage({
        action: "getDataError",
        error: e.target.error?.message || "Fetch failed",
      });
    };

    leadsReq.onsuccess = () => {
      dealsReq.onsuccess = () => {
        let leads = leadsReq.result || [];
        let deals = dealsReq.result || [];
        if (role === "super_admin") {
        } else if (role === "admin") {
          leads = leads.filter((l) => l.tenantId === tenantId);
          deals = deals.filter((d) => d.tenantId === tenantId);
        } else {
          leads = leads.filter(
            (l) => l.tenantId === tenantId && l.userId === userId,
          );
          deals = deals.filter(
            (d) => d.tenantId === tenantId && d.userId === userId,
          );
        }

        const lead_count = leads.length;
        const wonDeals = deals.filter((deal) => deal.deal_status === "Won");
        const deals_won = wonDeals.length;
        const deals_ongoing = deals.length - deals_won;
        const deal_value_won = wonDeals.reduce(
          (sum, deal) => sum + (deal.deal_value || 0),
          0,
        );
        const totalValue = deals.reduce(
          (sum, deal) => sum + (deal.deal_value || 0),
          0,
        );
        const avg_deal_value =
          deals.length > 0 ? (totalValue / deals.length).toFixed(2) : "0";

        const statusSegmentMap = buildStatusSegmentMap(leads);
        const industrySegmentMap = buildIndustrySegmentMap(leads);

        const statusSegments = mapToArray(statusSegmentMap);
        const industrySegments = mapToArray(industrySegmentMap);
        postMessage({
          action: "getDataSuccess",
          lead_count,
          deals_won,
          deals_ongoing,
          deal_value_won,
          avg_deal_value,
          statusSegments,
          industrySegments,
          totalLeads: leads.length,
        });
      };
    };
  } catch (error) {
    postMessage({
      action: "getDataError",
      error: error.message,
    });
  }
}
