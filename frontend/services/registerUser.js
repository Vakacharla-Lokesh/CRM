export async function registerUser(
  name,
  email,
  password,
  isNewTenant = false,
  tenantName = "",
) {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open("CRM_DB");

      request.onsuccess = (event) => {
        const db = event.target.result;
        const userTx = db.transaction("Users", "readonly");
        const userStore = userTx.objectStore("Users");
        const getAllUsersRequest = userStore.getAll();

        getAllUsersRequest.onsuccess = () => {
          const users = getAllUsersRequest.result;

          const userExists = users.some(
            (u) => u.user_email?.toLowerCase() === email.toLowerCase(),
          );

          if (userExists) {
            resolve({
              success: false,
              error:
                "Email already registered. Please use a different email or login.",
            });
            return;
          }

          // Handle tenant creation/selection
          if (isNewTenant) {
            // Create new tenant
            const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const tenantData = {
              tenant_id: tenantId,
              tenant_name: tenantName,
              created_at: new Date().toISOString(),
            };

            const tenantTx = db.transaction("Tenants", "readwrite");
            const tenantStore = tenantTx.objectStore("Tenants");
            const addTenantRequest = tenantStore.add(tenantData);

            addTenantRequest.onsuccess = () => {
              // Create admin user for new tenant
              createUser(
                db,
                name,
                email,
                password,
                tenantId,
                "admin",
                resolve,
                reject,
              );
            };

            addTenantRequest.onerror = () => {
              reject(new Error("Failed to create tenant"));
            };
          } else {
            // Use existing tenant (this should not happen in signup, but kept for safety)
            reject(new Error("Please specify a tenant for signup"));
          }
        };

        getAllUsersRequest.onerror = () => {
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

function createUser(
  db,
  name,
  email,
  password,
  tenantId,
  role,
  resolve,
  reject,
) {
  const newUser = {
    user_id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_name: name,
    user_email: email,
    password: password,
    tenant_id: tenantId,
    role: role,
    first_name: name.split(" ")[0] || name,
    last_name: name.split(" ").slice(1).join(" ") || "",
    mobile: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

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
        tenantId: newUser.tenant_id,
        role: newUser.role,
      },
    });
  };

  addRequest.onerror = () => {
    reject(new Error("Failed to create user in database"));
  };
}
