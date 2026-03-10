const SESSION_DB_NAME = "campaignFluxSessionDB";
const SESSION_DB_VERSION = 1;
const SESSION_STORE = "pendingSessionEvents";

export interface PendingSessionEvent {
  id: string;
  sessionId: string;
  tenantId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

let _db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SESSION_DB_NAME, SESSION_DB_VERSION);

    req.onerror = () => reject(req.error);

    req.onsuccess = () => {
      _db = req.result;
      resolve(_db);
    };

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: "id" });
      }
    };
  });
};

export const enqueueSessionEvent = async (
  event: Omit<PendingSessionEvent, "id">,
): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const tx = db.transaction(SESSION_STORE, "readwrite");
    const store = tx.objectStore(SESSION_STORE);
    const req = store.add({ ...event, id });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const getPendingSessionEvents = async (): Promise<
  PendingSessionEvent[]
> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, "readonly");
    const store = tx.objectStore(SESSION_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as PendingSessionEvent[]);
    req.onerror = () => reject(req.error);
  });
};

export const clearSessionEvents = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, "readwrite");
    const store = tx.objectStore(SESSION_STORE);
    let remaining = ids.length;
    let hasError = false;

    for (const id of ids) {
      const req = store.delete(id);
      req.onerror = () => {
        if (!hasError) {
          hasError = true;
          reject(req.error);
        }
      };
      req.onsuccess = () => {
        remaining--;
        if (remaining === 0 && !hasError) resolve();
      };
    }
  });
};

export const countPendingSessionEvents = async (): Promise<number> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, "readonly");
    const store = tx.objectStore(SESSION_STORE);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};
