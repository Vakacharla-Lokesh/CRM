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

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve();
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

async function attemptCookieRefresh(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new APIError(
      response.status,
      {},
      "Session expired. Please log in again.",
    );
  }
}

async function withSilentRefresh<T>(
  endpoint: string,
  doRequest: () => Promise<T>,
): Promise<T> {
  if (isAuthEndpoint(endpoint)) {
    return doRequest();
  }

  try {
    return await doRequest();
  } catch (error) {
    if (!(error instanceof APIError) || error.statusCode !== 401) {
      throw error;
    }

    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        pendingQueue.push({
          resolve: () => doRequest().then(resolve).catch(reject),
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      await attemptCookieRefresh();
    } catch (refreshError) {
      processQueue(refreshError);
      window.dispatchEvent(new Event("auth:logout"));
      throw refreshError;
    } finally {
      isRefreshing = false;
    }

    processQueue(null);
    return doRequest();
  }
}

function enrichErrorWithRetryInfo(error: unknown): APIError {
  if (error instanceof APIError) {
    if (
      (error.statusCode >= 500 && error.statusCode < 600) ||
      error.statusCode === 429
    ) {
      return new APIError(error.statusCode, error.data, error.message, true);
    }
  }

  if (error instanceof Error) {
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
    throw enrichErrorWithRetryInfo(error);
  }
}

export async function get<T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return withSilentRefresh(endpoint, async () => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw enrichErrorWithRetryInfo(
        new APIError(
          response.status,
          errorData,
          errorData.message || "Request failed",
        ),
      );
    }
    return response.json() as Promise<T>;
  });
}

export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return withSilentRefresh(endpoint, async () => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw enrichErrorWithRetryInfo(
        new APIError(
          response.status,
          errorData,
          errorData.message || "Request failed",
        ),
      );
    }
    return response.json() as Promise<T>;
  });
}

export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return withSilentRefresh(endpoint, async () => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw enrichErrorWithRetryInfo(
        new APIError(
          response.status,
          errorData,
          errorData.message || "Request failed",
        ),
      );
    }
    return response.json() as Promise<T>;
  });
}

export async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  return withSilentRefresh(endpoint, async () => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw enrichErrorWithRetryInfo(
        new APIError(
          response.status,
          errorData,
          errorData.message || "Request failed",
        ),
      );
    }
    return response.json() as Promise<T>;
  });
}

export async function delete_<T>(endpoint: string): Promise<T> {
  return withSilentRefresh(endpoint, async () => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw enrichErrorWithRetryInfo(
        new APIError(
          response.status,
          errorData,
          errorData.message || "Request failed",
        ),
      );
    }
    return response.json() as Promise<T>;
  });
}

export async function upload<T>(
  endpoint: string,
  file: File | Blob,
): Promise<T> {
  return withSilentRefresh(endpoint, async () => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw enrichErrorWithRetryInfo(
        new APIError(
          response.status,
          errorData,
          errorData.message || "Upload failed",
        ),
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
