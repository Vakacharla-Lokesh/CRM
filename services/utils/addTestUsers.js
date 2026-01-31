import { dbCreate } from "../../init/dbInit.js";

export async function addTestUsers(db) {
  try {
    // const db = await dbCreate();

    const testTenants = [
      {
        tenant_id: "tenant_acme",
        tenant_name: "Acme Corporation",
        created_at: new Date().toISOString(),
      },
      {
        tenant_id: "tenant_techstart",
        tenant_name: "TechStart Solutions",
        created_at: new Date().toISOString(),
      },
    ];

    const tenantTx = db.transaction("Tenants", "readwrite");
    const tenantStore = tenantTx.objectStore("Tenants");

    for (const tenant of testTenants) {
      const tenantRequest = tenantStore.add(tenant);

      tenantRequest.onsuccess = () => {
        console.log(`Added tenant: ${tenant.tenant_name}`);
      };

      tenantRequest.onerror = (e) => {
        if (e.target.error.name === "ConstraintError") {
          console.log(
            `Tenant ${tenant.tenant_name} already exists, skipping...`,
          );
        } else {
          console.error(
            `Error adding tenant ${tenant.tenant_name}:`,
            e.target.error,
          );
        }
      };
    }

    await new Promise((resolve) => {
      tenantTx.oncomplete = resolve;
      tenantTx.onerror = resolve;
    });
    const testUsers = [
      {
        user_id: "user_admin_acme",
        user_email: "admin@acme.com",
        password: "admin123",
        user_name: "Admin User",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        tenant_id: "tenant_acme",
        mobile: "9876543210",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: "user_john_acme",
        user_email: "john.doe@acme.com",
        password: "john123",
        user_name: "John Doe",
        first_name: "John",
        last_name: "Doe",
        role: "user",
        tenant_id: "tenant_acme",
        mobile: "9876543211",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: "user_jane_techstart",
        user_email: "jane.smith@techstart.com",
        password: "jane123",
        user_name: "Jane Smith",
        first_name: "Jane",
        last_name: "Smith",
        role: "admin",
        tenant_id: "tenant_techstart",
        mobile: "9876543212",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: "user_test",
        user_email: "test@example.com",
        password: "test123",
        user_name: "Test User",
        first_name: "Test",
        last_name: "User",
        role: "user",
        tenant_id: "tenant_acme",
        mobile: "9876543213",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: "user_super_admin",
        user_email: "superadmin@crm.com",
        password: "super123",
        user_name: "Super Admin",
        first_name: "Super",
        last_name: "Admin",
        role: "super_admin",
        tenant_id: null,
        mobile: "9999999999",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const tx = db.transaction("Users", "readwrite");
    const store = tx.objectStore("Users");

    for (const user of testUsers) {
      const request = store.add(user);

      request.onsuccess = () => {
        console.log(
          `✓ Added user: ${user.user_email} (${user.tenant_id || "super_admin"})`,
        );
      };

      request.onerror = (e) => {
        if (e.target.error.name === "ConstraintError") {
          console.log(`User ${user.user_email} already exists, skipping...`);
        } else {
          console.error(
            `Error adding user ${user.user_email}:`,
            e.target.error,
          );
        }
      };
    }

    tx.oncomplete = () => {
      console.log("\n✅ All test users and tenants have been added!");
      console.log("\nTest Accounts:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("Acme Corporation (tenant_acme):");
      console.log("  Admin: admin@acme.com / admin123");
      console.log("  User:  john.doe@acme.com / john123");
      console.log("  User:  test@example.com / test123");
      console.log("\nTechStart Solutions (tenant_techstart):");
      console.log("  Admin: jane.smith@techstart.com / jane123");
      console.log("\nSuper Admin (all tenants):");
      console.log("  Super: superadmin@crm.com / super123");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
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
      console.log("\n📋 All Users:");
      console.table(
        request.result.map((u) => ({
          email: u.user_email,
          name: u.user_name,
          role: u.role,
          tenant: u.tenant_id || "N/A",
        })),
      );
    };

    request.onerror = () => {
      console.error("Error fetching users:", request.error);
    };
  } catch (error) {
    console.error("Error viewing users:", error);
  }
}

export async function viewAllTenants() {
  try {
    const db = await dbCreate();
    const tx = db.transaction("Tenants", "readonly");
    const store = tx.objectStore("Tenants");
    const request = store.getAll();

    request.onsuccess = () => {
      console.log("\n🏢 All Tenants:");
      console.table(request.result);
    };

    request.onerror = () => {
      console.error("Error fetching tenants:", request.error);
    };
  } catch (error) {
    console.error("Error viewing tenants:", error);
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

export async function clearAllTenants() {
  try {
    const db = await dbCreate();
    const tx = db.transaction("Tenants", "readwrite");
    const store = tx.objectStore("Tenants");
    const request = store.clear();

    request.onsuccess = () => {
      console.log("All tenants have been cleared");
    };

    request.onerror = () => {
      console.error("Error clearing tenants:", request.error);
    };
  } catch (error) {
    console.error("Error clearing tenants:", error);
  }
}

// Usage instructions for browser console:
// To add test users:
// import { addTestUsers } from './services/addTestUsers.js'; addTestUsers();
//
// To view all users:
// import { viewAllUsers } from './services/addTestUsers.js'; viewAllUsers();
//
// To view all tenants:
// import { viewAllTenants } from './services/addTestUsers.js'; viewAllTenants();
