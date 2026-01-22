import { dbCreate } from "../init/dbInit.js";

export async function addTestUsers() {
  try {
    const db = await dbCreate();
    
    const testUsers = [
      {
        user_id: 1,
        user_email: "admin@example.com",
        password: "admin123",
        name: "Admin User",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        user_id: 2,
        user_email: "john.doe@example.com",
        password: "john123",
        name: "John Doe",
        role: "user",
        createdAt: new Date().toISOString(),
      },
      {
        user_id: 3,
        user_email: "jane.smith@example.com",
        password: "jane123",
        name: "Jane Smith",
        role: "user",
        createdAt: new Date().toISOString(),
      },
      {
        user_id: 4,
        user_email: "testing@example.com",
        password: "testing",
        name: "Test User",
        role: "user",
        createdAt: new Date().toISOString(),
      },
    ];

    const tx = db.transaction("Users", "readwrite");
    const store = tx.objectStore("Users");

    for (const user of testUsers) {
      const request = store.add(user);
      
      request.onsuccess = () => {
        console.log(`✓ Added user: ${user.user_email}`);
      };
      
      request.onerror = (e) => {
        // User might already exist, so we can update instead
        if (e.target.error.name === "ConstraintError") {
          console.log(`User ${user.user_email} already exists, skipping...`);
        } else {
          console.error(`Error adding user ${user.user_email}:`, e.target.error);
        }
      };
    }

    tx.oncomplete = () => {
      console.log("All test users have been added");
    };

    tx.onerror = () => {
      console.error("Transaction error:", tx.error);
    };

  } catch (error) {
    console.error("Error adding test users:", error);
  }
}

export async function viewAllUsers() {
  try {
    const db = await dbCreate();
    const tx = db.transaction("Users", "readonly");
    const store = tx.objectStore("Users");
    const request = store.getAll();

    request.onsuccess = () => {
      console.table(request.result);
    };

    request.onerror = () => {
      console.error("Error fetching users:", request.error);
    };
  } catch (error) {
    console.error("Error viewing users:", error);
  }
}

export async function clearAllUsers() {
  try {
    const db = await dbCreate();
    const tx = db.transaction("Users", "readwrite");
    const store = tx.objectStore("Users");
    const request = store.clear();

    request.onsuccess = () => {
      console.log("All users have been cleared");
    };

    request.onerror = () => {
      console.error("Error clearing users:", request.error);
    };
  } catch (error) {
    console.error("Error clearing users:", error);
  }
}
