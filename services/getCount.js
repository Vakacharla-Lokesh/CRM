export function getLeadCount(db) {
  console.log("Inside get count");
  const tx = db.transaction("Leads", "readonly");
  const objectStore = tx.objectStore("Leads");

  const countRequest = objectStore.count();

  countRequest.onsuccess = () => {
    console.log("Data Worker count: ... ", countRequest.result);
    postMessage({
      action: "getDataSuccess",
      count: countRequest.result,
    });
  };
}
