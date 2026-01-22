export function handleDealCreate(event) {
  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const dealData = {
    ...event.detail.dealData,
  };

  dbWorker.postMessage({
    action: "createDeal",
    dealData,
    storeName: "Deals",
  });
}

export function handleDealCreated(event) {
  showNotification("Deal created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/deals" && dbWorker) {
    dbWorker.postMessage({ action: "getAllDeals" });
  }
}
