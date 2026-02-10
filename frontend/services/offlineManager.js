export const offlineManager = {
  isOnline() {
    return window.isSync == true;
  },

  async syncAllFromIndexedDB(dbWorker) {
    if (!this.isOnline()) {
      console.warn("[OfflineManager] Cannot sync while offline");
      return { success: false, message: "Cannot sync while offline" };
    }

    if (!dbWorker) {
      console.error("[OfflineManager] DB Worker not available");
      return { success: false, message: "DB Worker not available" };
    }

    console.log("[OfflineManager] Starting sync from IndexedDB to MongoDB...");

    try {
      const { syncSingleEntityToBackend } = await import(
        "./data/initialDataSync.js"
      );

      // Get all data from IndexedDB via promises
      const getAllData = (storeName) => {
        return new Promise((resolve) => {
          const handler = (e) => {
            if (e.data.action === `getAll${storeName}Success`) {
              dbWorker.removeEventListener("message", handler);
              resolve(e.data.data || []);
            }
          };
          dbWorker.addEventListener("message", handler);
          dbWorker.postMessage({ action: `getAll${storeName}` });
        });
      };

      const [leads, organizations, deals] = await Promise.all([
        getAllData("Leads"),
        getAllData("Organizations"),
        getAllData("Deals"),
      ]);

      let synced = 0;
      let errors = 0;

      // Sync leads
      for (const lead of leads) {
        try {
          await syncSingleEntityToBackend("leads", lead, "create");
          synced++;
        } catch (error) {
          console.error("Failed to sync lead:", error);
          errors++;
        }
      }

      // Sync organizations
      for (const org of organizations) {
        try {
          await syncSingleEntityToBackend("organizations", org, "create");
          synced++;
        } catch (error) {
          console.error("Failed to sync organization:", error);
          errors++;
        }
      }

      // Sync deals
      for (const deal of deals) {
        try {
          await syncSingleEntityToBackend("deals", deal, "create");
          synced++;
        } catch (error) {
          console.error("Failed to sync deal:", error);
          errors++;
        }
      }

      console.log(
        `[OfflineManager] Sync completed: ${synced} items synced, ${errors} errors`,
      );

      return {
        success: true,
        synced,
        errors,
        total: leads.length + organizations.length + deals.length,
      };
    } catch (error) {
      console.error("[OfflineManager] Sync failed:", error);
      return { success: false, message: error.message };
    }
  },

  async getIndexedDBCount(dbWorker) {
    if (!dbWorker) return 0;

    try {
      const getCount = (storeName) => {
        return new Promise((resolve) => {
          const handler = (e) => {
            if (e.data.action === `getAll${storeName}Success`) {
              dbWorker.removeEventListener("message", handler);
              resolve((e.data.data || []).length);
            }
          };
          dbWorker.addEventListener("message", handler);
          dbWorker.postMessage({ action: `getAll${storeName}` });
        });
      };

      const [leadsCount, orgsCount, dealsCount] = await Promise.all([
        getCount("Leads"),
        getCount("Organizations"),
        getCount("Deals"),
      ]);

      return leadsCount + orgsCount + dealsCount;
    } catch (error) {
      console.error("[OfflineManager] Error getting count:", error);
      return 0;
    }
  },
};
