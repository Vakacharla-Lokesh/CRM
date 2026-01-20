export function getCount(db) {
  console.log("Inside get count");
  const tx = db.transaction("Leads", "readonly");
  const objectStore = tx.objectStore("Leads");

  const countRequest = objectStore.count();

  // const tx2 = db.transaction("Deals", "readonly");
  // const store = tx.objectStore("Deals");
  // const index = store.index("deal_status");
  // const request = index.getAll("Won");

  // request.onsuccess = function () {
  //   const users = request.result;
  //   console.log("Users with role:", users);
  // };

  countRequest.onsuccess = () => {
    console.log("Data Worker count: ... ", countRequest.result);
    postMessage({
      action: "getDataSuccess",
      lead_count: countRequest.result,
    });
  };
}
