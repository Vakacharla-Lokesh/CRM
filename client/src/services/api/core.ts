export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export class APIError extends Error {
  statusCode: number;
  data: unknown;

  constructor(statusCode: number, data: unknown, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = "APIError";
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

    try {
      const newToken = await attemptTokenRefresh();
      processQueue(null, newToken);
      return await doRequest(newToken);
    } catch (refreshError) {
      processQueue(refreshError, null);
      window.dispatchEvent(new Event("auth:logout"));
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
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
      throw new APIError(
        response.status,
        errorData,
        errorData.message || "Request failed",
      );
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
      throw new APIError(
        response.status,
        errorData,
        errorData.message || "Request failed",
      );
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
      throw new APIError(
        response.status,
        errorData,
        errorData.message || "Request failed",
      );
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
      throw new APIError(
        response.status,
        errorData,
        errorData.message || "Request failed",
      );
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
      throw new APIError(
        response.status,
        errorData,
        errorData.message || "Request failed",
      );
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
      throw new APIError(
        response.status,
        errorData,
        errorData.message || "Upload failed",
      );
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
