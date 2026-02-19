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

interface ErrorResponse {
  response: {
    status: number;
    data: {
      message?: string;
      [key: string]: unknown;
    };
  };
}

function handleErrorResponse(error: unknown): never {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as ErrorResponse).response;
    if (
      response &&
      typeof response === "object" &&
      "status" in response &&
      "data" in response
    ) {
      const message = response.data?.message || "API Error";
      throw new APIError(response.status as number, response.data, message);
    }
  }
  throw error;
}

export function getToken(): string | null {
  let token = localStorage.getItem("auth_token");
  // Remove surrounding quotes if they exist
  if (!token) {
    return null;
  }
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

export async function get<T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
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

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

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

    return await response.json();
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

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
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

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
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export async function delete_<T>(endpoint: string): Promise<T> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

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
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

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
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export async function upload<T>(
  endpoint: string,
  file: File | Blob,
): Promise<T> {
  try {
    const headers: Record<string, string> = {};

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

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
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: delete_,
  upload,
};
