// Registration service that wraps the API call
import { registerUser as apiRegisterUser } from "./auth/authService.js";

/**
 * Register a new user with optional tenant creation
 * @param {string} name - User's full name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {boolean} isNewTenant - Whether to create a new tenant
 * @param {string} tenantName - Name of the tenant (if creating new)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
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

