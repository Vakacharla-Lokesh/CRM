// Re-export registration function from the new auth service
// This maintains backward compatibility with existing code
import { registerUser as apiRegisterUser } from "./auth/authService.js";
import { apiClient, API_ENDPOINTS } from "./api/apiClient.js";

export async function registerUser(
  name,
  email,
  password,
  isNewTenant = false,
  tenantName = "",
) {
  try {
    // Split name into firstName and lastName
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(" ") || "";

    // Prepare registration data
    const registrationData = {
      firstName,
      lastName: lastName || undefined,
      userEmail: email,
      password,
      mobile: "", // Optional, can be empty
    };

    // If creating a new tenant, include tenant information
    if (isNewTenant) {
      registrationData.tenantName = tenantName;
      registrationData.role = "admin"; // First user of a new tenant is admin
    } else {
      registrationData.role = "user"; // Default role
    }

    // Call API to register user
    const result = await apiRegisterUser(registrationData);

    return result;
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error.message || "Failed to register. Please try again.",
    };
  }
}

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
