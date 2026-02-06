export async function checkUserLogin(email, password) {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open("CRM_DB");

      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction("Users", "readonly");
        const store = tx.objectStore("Users");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const users = getAllRequest.result;

          // Find user by email and password
          const user = users.find(
            (u) =>
              u.user_email?.toLowerCase() === email.toLowerCase() &&
              u.password === password,
          );

          if (user) {
            resolve({
              success: true,
              user: {
                userId: user.user_id,
                email: user.user_email,
                name: user.user_name || user.name || "User",
                role: user.role || "user",
                tenantId: user.tenant_id,
              },
            });
          } else {
            resolve({
              success: false,
              error: "Invalid email or password",
            });
          }
        };

        getAllRequest.onerror = () => {
          reject(new Error("Failed to fetch users from database"));
        };
      };

      request.onerror = () => {
        reject(new Error("Failed to open database"));
      };
    } catch (error) {
      reject(error);
    }
  });
}

export async function userExists(email) {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open("CRM");

      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction("Users", "readonly");
        const store = tx.objectStore("Users");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const users = getAllRequest.result;
          const exists = users.some(
            (u) => u.user_email?.toLowerCase() === email.toLowerCase(),
          );
          resolve(exists);
        };

        getAllRequest.onerror = () => {
          reject(new Error("Failed to fetch users from database"));
        };
      };

      request.onerror = () => {
        reject(new Error("Failed to open database"));
      };
    } catch (error) {
      reject(error);
    }
  });
}

export async function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open("CRM");

      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction("Users", "readonly");
        const store = tx.objectStore("Users");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const users = getAllRequest.result;
          const user = users.find(
            (u) => u.user_email?.toLowerCase() === email.toLowerCase(),
          );
          resolve(user || null);
        };

        getAllRequest.onerror = () => {
          reject(new Error("Failed to fetch users from database"));
        };
      };

      request.onerror = () => {
        reject(new Error("Failed to open database"));
      };
    } catch (error) {
      reject(error);
    }
  });
}
