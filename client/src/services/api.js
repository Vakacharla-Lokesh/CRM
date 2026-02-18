/**
 * API Client
 * HTTP client for making API requests with authentication and error handling
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Get authentication token
 */
const getAuthToken = () => {
  try {
    const token = localStorage.getItem("auth_token");
    return token ? JSON.parse(token) : null;
  } catch {
    return localStorage.getItem("auth_token");
  }
};

/**
 * Create request headers
 */
const createHeaders = (customHeaders = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(
      data.message || `HTTP error! status: ${response.status}`,
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Make API request with timeout
 */
const requestWithTimeout = (url, options, timeout = DEFAULT_TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout),
    ),
  ]);
};

/**
 * API Client object
 */
const apiClient = {
  /**
   * GET request
   */
  get: async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const response = await requestWithTimeout(
      url,
      {
        method: "GET",
        headers: createHeaders(options.headers),
        signal: options.signal,
      },
      options.timeout,
    );

    return handleResponse(response);
  },

  /**
   * POST request
   */
  post: async (endpoint, data = null, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const response = await requestWithTimeout(
      url,
      {
        method: "POST",
        headers: createHeaders(options.headers),
        body: data ? JSON.stringify(data) : null,
        signal: options.signal,
      },
      options.timeout,
    );

    return handleResponse(response);
  },

  /**
   * PUT request
   */
  put: async (endpoint, data = null, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const response = await requestWithTimeout(
      url,
      {
        method: "PUT",
        headers: createHeaders(options.headers),
        body: data ? JSON.stringify(data) : null,
        signal: options.signal,
      },
      options.timeout,
    );

    return handleResponse(response);
  },

  /**
   * PATCH request
   */
  patch: async (endpoint, data = null, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const response = await requestWithTimeout(
      url,
      {
        method: "PATCH",
        headers: createHeaders(options.headers),
        body: data ? JSON.stringify(data) : null,
        signal: options.signal,
      },
      options.timeout,
    );

    return handleResponse(response);
  },

  /**
   * DELETE request
   */
  delete: async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const response = await requestWithTimeout(
      url,
      {
        method: "DELETE",
        headers: createHeaders(options.headers),
        signal: options.signal,
      },
      options.timeout,
    );

    return handleResponse(response);
  },

  /**
   * Upload file
   */
  upload: async (endpoint, file, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const formData = new FormData();
    formData.append("file", file);

    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await requestWithTimeout(
      url,
      {
        method: "POST",
        headers: { ...headers, ...options.headers },
        body: formData,
        signal: options.signal,
      },
      options.timeout,
    );

    return handleResponse(response);
  },
};

export default apiClient;
