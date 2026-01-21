export async function registerUser(name, email, password) {
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
          
          // Check if user already exists
          const userExists = users.some(
            (u) => u.user_email?.toLowerCase() === email.toLowerCase()
          );

          if (userExists) {
            resolve({
              success: false,
              error: "Email already registered. Please use a different email.",
            });
            return;
          }

          // Create new user object
          const newUser = {
            user_id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_name: name,
            user_email: email,
            password: password,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Insert new user
          const writeTx = db.transaction("Users", "readwrite");
          const writeStore = writeTx.objectStore("Users");
          const addRequest = writeStore.add(newUser);

          addRequest.onsuccess = () => {
            resolve({
              success: true,
              user: {
                userId: newUser.user_id,
                name: newUser.user_name,
                email: newUser.user_email,
              },
            });
          };

          addRequest.onerror = () => {
            reject(new Error("Failed to create user in database"));
          };
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
