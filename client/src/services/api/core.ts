export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export class APIError extends Error {
  statusCode: number;
  data: unknown;
  isRetryable: boolean;
  timestamp: Date;

  constructor(
    statusCode: number,
    data: unknown,
    message: string,
    isRetryable: boolean = false,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = "APIError";
    this.isRetryable = isRetryable;
    this.timestamp = new Date();

    Object.setPrototypeOf(this, APIError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      isRetryable: this.isRetryable,
      timestamp: this.timestamp.toISOString(),
      data: this.data,
    };
  }
}

export function getToken(): string | null {
  let token = localStorage.getItem("auth_token");
  if (!token) return null;
  token = token.trim();
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }
  return token;
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("auth_token");
}

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  pendingQueue = [];
}

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
];

function isAuthEndpoint(endpoint: string): boolean {
  return AUTH_ENDPOINTS.some((e) => endpoint.includes(e));
}

async function attemptTokenRefresh(): Promise<string> {
  let rawRefreshToken = localStorage.getItem("refresh_token") ?? "";
  rawRefreshToken = rawRefreshToken.trim();
  if (rawRefreshToken.startsWith('"') && rawRefreshToken.endsWith('"')) {
    rawRefreshToken = rawRefreshToken.slice(1, -1);
  }
  if (!rawRefreshToken) throw new Error("No refresh token available");

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rawRefreshToken }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new APIError(response.status, {}, "Refresh token invalid or expired");
  }

  const data = await response.json();

  localStorage.setItem("auth_token", JSON.stringify(data.token));
  if (data.refreshToken) {
    localStorage.setItem("refresh_token", JSON.stringify(data.refreshToken));
  }

  return data.token;
}

async function withSilentRefresh<T>(
  endpoint: string,
  doRequest: (token: string | null) => Promise<T>,
): Promise<T> {
  if (isAuthEndpoint(endpoint)) {
    return doRequest(getToken());
  }

  try {
    return await doRequest(getToken());
  } catch (error) {
    if (!(error instanceof APIError) || error.statusCode !== 401) {
      throw error;
    }

    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => doRequest(token).then(resolve).catch(reject),
          reject,
        });
      });
    }

    isRefreshing = true;

    let newToken: string;
    try {
      newToken = await attemptTokenRefresh();
    } catch (refreshError) {
      processQueue(refreshError, null);
      window.dispatchEvent(new Event("auth:logout"));
      throw refreshError;
    } finally {
      isRefreshing = false;
    }

    processQueue(null, newToken);
    return doRequest(newToken);
  }
}

function enrichErrorWithRetryInfo(error: unknown): APIError {
  if (error instanceof APIError) {
    if (
      (error.statusCode >= 500 && error.statusCode < 600) ||
      error.statusCode === 429
    ) {
      return new APIError(
        error.statusCode,
        error.data,
        error.message,
        true, // isRetryable
      );
    }
  }

  if (error instanceof Error) {
    // Network errors are retryable
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch")
    ) {
      return new APIError(0, {}, error.message, true);
    }
  }

  return error instanceof APIError ? error : new APIError(0, {}, String(error));
}

export async function wrapWithErrorInterceptor<T>(
  apiCall: () => Promise<T>,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    const enrichedError = enrichErrorWithRetryInfo(error);
    throw enrichedError;
  }
}

export async function get<T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return withSilentRefresh(endpoint, async (token) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = new APIError(
        response.status,
        errorData,
        errorData.message || "Request failed",
      );
      throw enrichErrorWithRetryInfo(apiError);
    }
    return response.json() as Promise<T>;
  });
}

export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return withSilentRefresh(endpoint, async (token) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = new APIError(
        response.status,
        errorData,
        errorData.message || "Request failed",
      );
      throw enrichErrorWithRetryInfo(apiError);
    }
    return response.json() as Promise<T>;
  });
}

export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return withSilentRefresh(endpoint, async (token) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = new APIError(
        response.status,
        errorData,
        errorData.message || "Request failed",
      );
      throw enrichErrorWithRetryInfo(apiError);
    }
    return response.json() as Promise<T>;
  });
}

export async function delete_<T>(endpoint: string): Promise<T> {
  return withSilentRefresh(endpoint, async (token) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = new APIError(
        response.status,
        errorData,
        errorData.message || "Request failed",
      );
      throw enrichErrorWithRetryInfo(apiError);
    }
    return response.json() as Promise<T>;
  });
}

export async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  return withSilentRefresh(endpoint, async (token) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = new APIError(
        response.status,
        errorData,
        errorData.message || "Request failed",
      );
      throw enrichErrorWithRetryInfo(apiError);
    }
    return response.json() as Promise<T>;
  });
}

export async function upload<T>(
  endpoint: string,
  file: File | Blob,
): Promise<T> {
  return withSilentRefresh(endpoint, async (token) => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = new APIError(
        response.status,
        errorData,
        errorData.message || "Upload failed",
      );
      throw enrichErrorWithRetryInfo(apiError);
    }
    return response.json() as Promise<T>;
  });
}

export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: delete_,
  upload,
};
