// import { getAllData } from "./getDb";

function scoreLead(lead) {
  let score = 0;

  //   score += (lead.visits || 0) * 2;
  //   score += (lead.opens || 0) * 3;
  //   score += (lead.clicks || 0) * 5;
  score += (lead.comments || 0) * 4;

  if (lead.organization_size >= 100) score += 10;
  if (lead.organization_size >= 500) score += 10;

  if (lead.email && !lead.email.includes("gmail.com")) {
    score += 5;
  }

  return score;
}

// export async function generateLeadScores(db, dbReady) {
//   const leads = getAllData("Leads", dbReady, db);

//   const objectStore = db
//     .transaction(["toDoList"], "readwrite")
//     .objectStore("toDoList");

//   const scoredLeads = leads.map((lead) => ({
//     ...lead,
//     score: scoreLead(lead),
//   }));

//   scoredLeads.sort((a, b) => b.score - a.score);

//   return scoredLeads;
// }

export function updateAllObjects() {
  const request = indexedDB.open("CRM_DB", 2);

  request.onsuccess = function () {
    const db = request.result;
    const transaction = db.transaction("Leads", "readwrite");
    const objectStore = transaction.objectStore("Leads");

    const cursorRequest = objectStore.openCursor();

    cursorRequest.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        const updatedData = cursor.value;
        // updatedData.updatedAt = new Date().toISOString();
        console.log(cursor.value);
        updatedData.score = scoreLead(cursor.value);

        const updateRequest = cursor.update(updatedData);

        updateRequest.onsuccess = function () {
          console.log("Record updated:", cursor.key);
        };

        cursor.continue();
      } else {
        console.log("All records updated.");
      }
    };

    transaction.oncomplete = function () {
      db.close();
    };
  };
}

// updateAllObjects();
