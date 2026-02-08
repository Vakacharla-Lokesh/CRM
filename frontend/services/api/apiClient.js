const API_BASE_URL = "http://localhost:4000/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.token || "";
  }

  // Create headers with auth token
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed [${endpoint}]:`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// API endpoints organized by resource
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    REFRESH: "/auth/refresh",
  },

  // Lead endpoints
  LEADS: {
    GET_ALL: "/leads",
    GET_BY_ID: (id) => `/leads/${id}`,
    CREATE: "/leads",
    UPDATE: (id) => `/leads/${id}`,
    DELETE: (id) => `/leads/${id}`,
    BY_TENANT: (tenantId) => `/leads/tenant/${tenantId}`,
    BY_USER: (userId) => `/leads/user/${userId}`,
  },

  // Organization endpoints
  ORGANIZATIONS: {
    GET_ALL: "/organizations",
    GET_BY_ID: (id) => `/organizations/${id}`,
    CREATE: "/organizations",
    UPDATE: (id) => `/organizations/${id}`,
    DELETE: (id) => `/organizations/${id}`,
    BY_TENANT: (tenantId) => `/organizations/tenant/${tenantId}`,
    BY_USER: (userId) => `/organizations/user/${userId}`,
  },

  // Deal endpoints
  DEALS: {
    GET_ALL: "/deals",
    GET_BY_ID: (id) => `/deals/${id}`,
    CREATE: "/deals",
    UPDATE: (id) => `/deals/${id}`,
    DELETE: (id) => `/deals/${id}`,
    BY_TENANT: (tenantId) => `/deals/tenant/${tenantId}`,
    BY_USER: (userId) => `/deals/user/${userId}`,
  },

  // User endpoints
  USERS: {
    GET_ALL: "/users",
    GET_BY_ID: (id) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    BY_TENANT: (tenantId) => `/users/tenant/${tenantId}`,
    UPDATE_ROLE: (id) => `/users/${id}/role`,
  },

  // Tenant endpoints
  TENANTS: {
    GET_ALL: "/tenants",
    GET_BY_ID: (id) => `/tenants/${id}`,
    CREATE: "/tenants",
    UPDATE: (id) => `/tenants/${id}`,
    DELETE: (id) => `/tenants/${id}`,
  },

  // Call endpoints
  CALLS: {
    GET_ALL: "/calls",
    GET_BY_ID: (id) => `/calls/${id}`,
    CREATE: "/calls",
    UPDATE: (id) => `/calls/${id}`,
    DELETE: (id) => `/calls/${id}`,
    BY_LEAD: (leadId) => `/calls/lead/${leadId}`,
  },

  // Comment endpoints
  COMMENTS: {
    GET_ALL: "/comments",
    GET_BY_ID: (id) => `/comments/${id}`,
    CREATE: "/comments",
    UPDATE: (id) => `/comments/${id}`,
    DELETE: (id) => `/comments/${id}`,
    BY_LEAD: (leadId) => `/comments/lead/${leadId}`,
  },

  // Attachment endpoints
  ATTACHMENTS: {
    GET_ALL: "/attachments",
    GET_BY_ID: (id) => `/attachments/${id}`,
    CREATE: "/attachments",
    DELETE: (id) => `/attachments/${id}`,
    BY_LEAD: (leadId) => `/attachments/lead/${leadId}`,
  },
};

export default apiClient;
