// export function getCount(db, dbReady, tenant_id, user_id, user_role) {
//   if (!dbReady || !db) {
//     console.error("Database not ready");
//     postMessage({
//       action: "getAllError",
//       error: "Database not ready",
//       storeName,
//     });
//     return;
//   }

//   try {
//     // console.log("Inside get count");
//     const tx = db.transaction("Leads", "readonly");
//     const objectStore = tx.objectStore("Leads");

//     const countRequest = objectStore.count();

//     const tx2 = db.transaction("Deals", "readonly");
//     const store = tx2.objectStore("Deals");

//     const request = store.getAll();

//     countRequest.onsuccess = () => {
//       // console.log("Data Worker count: ... ", countRequest.result);
//     };

//     request.onsuccess = function () {
//       let dealValue = 0;

//       const wonDeals = request.result.filter((deal) => {
//         if (deal.deal_status === "Won") {
//           dealValue += deal.deal_value;
//           return true;
//         }
//       });

//       const totalValue = request.result.reduce(
//         (accumulator, currentValue) => accumulator + currentValue.deal_value,
//         0,
//       );

//       const avg_value =
//         request.result.length != 0
//           ? Math.floor(totalValue / request.result.length).toFixed(2)
//           : 0;

//       // const ongoingDeals = request.result.filter(
//       //   (deal) => deal.deal_status === "Ongoing",
//       // );

//       const ongoingDeals = request.result.length - wonDeals.length;

//       // console.log("Users with role:", wonDeals);
//       // console.log("Users ongoing: ", ongoingDeals);
//       // console.log("Deal Value: ", dealValue);
//       // console.log("Avg deal value: ", avg_value);

//       postMessage({
//         action: "getDataSuccess",
//         lead_count: countRequest.result,
//         deals_won: wonDeals.length,
//         deals_ongoing: ongoingDeals,
//         deal_value_won: dealValue,
//         avg_deal_value: avg_value,
//       });
//     };
//   } catch (error) {
//     console.log(error);
//   }
// }

export function getCount(db, dbReady, tenant_id, user_id, role) {
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

        /* ================= ROLE FILTERING ================= */

        if (role === "super_admin") {
          // ✅ NO FILTERING — FULL DATA ACCESS
        } else if (role === "admin") {
          leads = leads.filter((l) => l.tenant_id === tenant_id);
          deals = deals.filter((d) => d.tenant_id === tenant_id);
        } else {
          // normal user
          leads = leads.filter(
            (l) => l.tenant_id === tenant_id && l.user_id === user_id,
          );
          deals = deals.filter(
            (d) => d.tenant_id === tenant_id && d.user_id === user_id,
          );
        }

        /* ================= CALCULATIONS ================= */

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

        postMessage({
          action: "getDataSuccess",
          lead_count,
          deals_won,
          deals_ongoing,
          deal_value_won,
          avg_deal_value,
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
