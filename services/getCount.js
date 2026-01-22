export function getCount(db, dbReady) {
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
    console.log("Inside get count");
    const tx = db.transaction("Leads", "readonly");
    const objectStore = tx.objectStore("Leads");

    const countRequest = objectStore.count();

    const tx2 = db.transaction("Deals", "readonly");
    const store = tx2.objectStore("Deals");

    const request = store.getAll();

    countRequest.onsuccess = () => {
      console.log("Data Worker count: ... ", countRequest.result);
    };

    request.onsuccess = function () {
      let dealValue = 0;

      const wonDeals = request.result.filter((deal) => {
        if (deal.deal_status === "Won") {
          dealValue += deal.deal_value;
          return true;
        }
      });

      // const ongoingDeals = request.result.filter(
      //   (deal) => deal.deal_status === "Ongoing",
      // );

      const ongoingDeals = request.result.length - wonDeals.length;

      console.log("Users with role:", wonDeals);
      // console.log("Users ongoing: ", ongoingDeals);
      console.log("Deal Value: ", dealValue);

      postMessage({
        action: "getDataSuccess",
        lead_count: countRequest.result,
        deals_won: wonDeals.length,
        deals_ongoing: ongoingDeals,
        deal_value_won: dealValue,
      });
    };
  } catch (error) {
    console.log(error);
  }
}
