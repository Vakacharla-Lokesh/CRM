// import { dbCreate } from "../init/dbInit";

// let db = null;
// let dbReady = false;

// console.log("Data Worker started, initializing database...");

// async function initializeDb() {
//   try {
//     db = await dbCreate();
//     dbReady = true;
//     console.log("Data Worker: Database ready");
//     self.postMessage({ action: "dbReady" });
//   } catch (error) {
//     console.error("Worker: Database initialization failed", error);
//     postMessage({ action: "dbError", error: error.message });
//   }
// }

// initializeDb();

function getLeadCount() {
  //   const tx = db.transaction("Leads", "readonly");
  //   const objectStore = tx.objectStore("Leads");

  //   const countRequest = objectStore.count();

  //   countRequest.onsuccess = () => {
  //     console.log("Data Worker count: ... ", countRequest.result);
  //     postMessage({
  //       action: "getLeadCountSuccess",
  //       count: countRequest.result,
  //     });
  //   };
  console.log("inside new worker");
}

self.onmessage = (e) => {
  console.log("Inside Data Worker: ...");
  console.log(e.data);
  switch (e.data.action) {
    case "getLeadCount":
      console.log("Inside Switch data worker ...");
      getLeadCount();
      break;
  }
};
