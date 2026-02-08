import { apiClient, API_ENDPOINTS } from "../api/apiClient.js";

/**
 * Authenticate user with email and password via API
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function checkUserLogin(email, password) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      userEmail: email,
      password,
    });

    if (response.success || response.token) {
      // Store user data and token in localStorage
      const userData = {
        user_id: response.user?.user_id || response.data?.user_id,
        user_email: response.user?.user_email || response.data?.user_email || email,
        user_name: response.user?.user_name || response.data?.user_name || response.user?.name || "User",
        role: response.user?.role || response.data?.role || "user",
        tenant_id: response.user?.tenant_id || response.data?.tenant_id,
        token: response.token || response.data?.token,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      return {
        success: true,
        user: userData,
      };
    } else {
      return {
        success: false,
        error: response.message || "Invalid email or password",
      };
    }
  } catch (error) {
    console.error("Login failed:", error);
    return {
      success: false,
      error: error.message || "Failed to login. Please try again.",
    };
  }
}

/**
 * Check if user exists by email via API
 * @param {string} email - User's email
 * @returns {Promise<boolean>}
 */
export async function userExists(email) {
  try {
    // Try to fetch user profile - if it succeeds, user exists
    const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.email?.toLowerCase() === email.toLowerCase();
  } catch (error) {
    // User doesn't exist or not found
    return false;
  }
}

/**
 * Get user by email via API
 * @param {string} email - User's email
 * @returns {Promise<object|null>}
 */
export async function getUserByEmail(email) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
    
    if (response.email?.toLowerCase() === email.toLowerCase()) {
      return {
        user_id: response.user_id,
        user_email: response.email || response.user_email,
        user_name: response.name || response.user_name,
        role: response.role,
        tenant_id: response.tenant_id,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Failed to get user by email:", error);
    return null;
  }
}

/**
 * Register a new user via API
 * @param {object} userData - User registration data
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function registerUser(userData) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);

    if (response.success || response.token) {
      const user = {
        user_id: response.user?.user_id || response.data?.user_id,
        user_email: response.user?.user_email || response.data?.user_email || userData.email,
        user_name: response.user?.user_name || response.data?.user_name || userData.name,
        role: response.user?.role || response.data?.role || "user",
        tenant_id: response.user?.tenant_id || response.data?.tenant_id,
        token: response.token || response.data?.token,
      };

      localStorage.setItem("user", JSON.stringify(user));

      return {
        success: true,
        user,
      };
    } else {
      return {
        success: false,
        error: response.message || "Registration failed",
      };
    }
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      error: error.message || "Failed to register. Please try again.",
    };
  }
}

/**
 * Logout user via API
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    // Clear local storage regardless of API call result
    localStorage.removeItem("user");
    sessionStorage.clear();
  }
}

/**
 * Get current user profile from API
 * @returns {Promise<object|null>}
 */
export async function getCurrentUserProfile() {
  try {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data || response;
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return null;
  }
}
