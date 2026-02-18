/**
 * Typed API Client Service
 * All API calls are fully typed and match backend endpoints
 */

import type {
  Lead,
  CreateLeadDTO,
  UpdateLeadDTO,
  LeadListResponse,
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserListResponse,
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationListResponse,
  Deal,
  CreateDealDTO,
  UpdateDealDTO,
  DealListResponse,
  Campaign,
  CreateCampaignDTO,
  UpdateCampaignDTO,
  CampaignListResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types";

import type { PointOfContact } from "../types/organizations";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Error handling utilities
 */
export class APIError extends Error {
  statusCode: number;
  data: unknown;

  constructor(statusCode: number, data: unknown, message: string) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

function handleErrorResponse(error: unknown): never {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response: { status: number; data: { message?: string } } };
    throw new APIError(
      err.response.status,
      err.response.data,
      err.response.data?.message || "An error occurred",
    );
  }
  throw error;
}

/**
 * HTTP methods with full typing
 */
async function get<T>(
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

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new APIError(
        response.status,
        await response.json(),
        "GET request failed",
      );
    }

    return response.json();
  } catch (error) {
    handleErrorResponse(error);
  }
}

async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new APIError(
        response.status,
        await response.json(),
        "POST request failed",
      );
    }

    return response.json();
  } catch (error) {
    handleErrorResponse(error);
  }
}

async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new APIError(
        response.status,
        await response.json(),
        "PUT request failed",
      );
    }

    return response.json();
  } catch (error) {
    handleErrorResponse(error);
  }
}

async function delete_<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new APIError(
        response.status,
        await response.json(),
        "DELETE request failed",
      );
    }

    return response.json();
  } catch (error) {
    handleErrorResponse(error);
  }
}

/**
 * Token management
 */
function getToken(): string {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return token;
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
}

/**
 * API Endpoints - Organized by resource
 */
export const API = {
  // ============ Auth ============
  auth: {
    login: (credentials: LoginRequest) =>
      post<LoginResponse>("/auth/login", credentials),

    register: (data: RegisterRequest) =>
      post<LoginResponse>("/auth/register", data),

    logout: () => delete_<void>("/auth/logout"),

    refreshToken: () => post<{ token: string }>("/auth/refresh", {}),
  },

  // ============ Leads ============
  leads: {
    list: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      organizationId?: string;
      userId?: string;
      search?: string;
    }) => get<LeadListResponse>("/leads", params),

    get: (id: string) => get<Lead>(`/leads/${id}`),

    create: (data: CreateLeadDTO) => post<Lead>("/leads", data),

    update: (id: string, data: UpdateLeadDTO) =>
      put<Lead>(`/leads/${id}`, data),

    delete: (id: string) => delete_<void>(`/leads/${id}`),

    bulkCreate: (leads: CreateLeadDTO[]) =>
      post<{ created: number; failed: number }>("/leads/bulk", { leads }),

    bulkUpdate: (updates: Array<{ id: string; data: UpdateLeadDTO }>) =>
      put<{ updated: number; failed: number }>("/leads/bulk", { updates }),

    assignToUser: (leadId: string, userId: string) =>
      put<Lead>(`/leads/${leadId}/assign`, { userId }),

    scoreLeads: (leadIds: string[]) =>
      post<Lead[]>("/leads/score", { leadIds }),

    getActivity: (leadId: string, params?: { page?: number; limit?: number }) =>
      get(`/leads/${leadId}/activity`, params),
  },

  // ============ Organizations ============
  organizations: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      get<OrganizationListResponse>("/organizations", params),

    get: (id: string) => get<Organization>(`/organizations/${id}`),

    create: (data: CreateOrganizationDTO) =>
      post<Organization>("/organizations", data),

    update: (id: string, data: UpdateOrganizationDTO) =>
      put<Organization>(`/organizations/${id}`, data),

    delete: (id: string) => delete_<void>(`/organizations/${id}`),

    getLeads: (id: string, params?: { page?: number; limit?: number }) =>
      get<LeadListResponse>(`/organizations/${id}/leads`, params),

    addPointOfContact: (id: string, contact: PointOfContact) =>
      post(`/organizations/${id}/contacts`, contact),

    updatePointOfContact: (id: string, contactId: string, contact: Partial<PointOfContact>) =>
      put(`/organizations/${id}/contacts/${contactId}`, contact),

    deletePointOfContact: (id: string, contactId: string) =>
      delete_(`/organizations/${id}/contacts/${contactId}`),
  },

  // ============ Users ============
  users: {
    list: (params?: { page?: number; limit?: number; role?: string }) =>
      get<UserListResponse>("/users", params),

    get: (id: string) => get<User>(`/users/${id}`),

    create: (data: CreateUserDTO) => post<User>("/users", data),

    update: (id: string, data: UpdateUserDTO) =>
      put<User>(`/users/${id}`, data),

    delete: (id: string) => delete_<void>(`/users/${id}`),

    getMe: () => get<User>("/users/me", {}),

    updatePassword: (currentPassword: string, newPassword: string) =>
      put<void>("/users/password", { currentPassword, newPassword }),

    getAssignedLeads: (
      userId: string,
      params?: { page?: number; limit?: number },
    ) => get<LeadListResponse>(`/users/${userId}/leads`, params),
  },

  // ============ Deals ============
  deals: {
    list: (params?: {
      page?: number;
      limit?: number;
      stage?: string;
      organizationId?: string;
      ownerId?: string;
    }) => get<DealListResponse>("/deals", params),

    get: (id: string) => get<Deal>(`/deals/${id}`),

    create: (data: CreateDealDTO) => post<Deal>("/deals", data),

    update: (id: string, data: UpdateDealDTO) =>
      put<Deal>(`/deals/${id}`, data),

    delete: (id: string) => delete_<void>(`/deals/${id}`),

    addLead: (dealId: string, leadId: string) =>
      post(`/deals/${dealId}/leads`, { leadId }),

    removeLead: (dealId: string, leadId: string) =>
      delete_(`/deals/${dealId}/leads/${leadId}`),

    getMetrics: (params?: { organizationId?: string; ownerId?: string }) =>
      get("/deals/metrics", params),
  },

  // ============ Campaigns ============
  campaigns: {
    list: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
      organizationId?: string;
    }) => get<CampaignListResponse>("/campaigns", params),

    get: (id: string) => get<Campaign>(`/campaigns/${id}`),

    create: (data: CreateCampaignDTO) => post<Campaign>("/campaigns", data),

    update: (id: string, data: UpdateCampaignDTO) =>
      put<Campaign>(`/campaigns/${id}`, data),

    delete: (id: string) => delete_<void>(`/campaigns/${id}`),

    draft: {
      save: (draft: Partial<Campaign>) => post("/campaigns/draft", draft),

      load: () => get("/campaigns/draft", {}),

      clear: () => delete_("/campaigns/draft"),
    },

    getMetrics: (id: string) => get(`/campaigns/${id}/metrics`, {}),

    sendTest: (id: string, recipientEmails: string[]) =>
      post(`/campaigns/${id}/test`, { recipientEmails }),
  },

  // ============ Bulk Operations ============
  bulk: {
    export: (entityType: string, params?: { format?: "csv" | "json" }) =>
      get(`/bulk/export/${entityType}`, params),

    import: (entityType: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetch(`${API_BASE_URL}/bulk/import/${entityType}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      }).then(async (response) => {
        if (!response.ok) {
          throw new APIError(
            response.status,
            await response.json(),
            "Import failed",
          );
        }
        return response.json();
      });
    },

    sync: () => post<{ synced: number; failed: number }>("/bulk/sync", {}),
  },

  // ============ Search/Analytics ============
  search: {
    global: (query: string, limit?: number) =>
      get("/search", { q: query, limit }),

    leads: (query: string, params?: Record<string, unknown>) =>
      get("/search/leads", { q: query, ...params }),

    organizations: (query: string, params?: Record<string, unknown>) =>
      get("/search/organizations", { q: query, ...params }),
  },

  analytics: {
    dashboard: (params?: {
      organizationId?: string;
      startDate?: string;
      endDate?: string;
    }) => get("/analytics/dashboard", params),

    leadTrends: (params?: Record<string, unknown>) => get("/analytics/leads/trends", params),

    dealPipeline: (params?: Record<string, unknown>) => get("/analytics/deals/pipeline", params),

    campaignPerformance: (params?: Record<string, unknown>) =>
      get("/analytics/campaigns/performance", params),
  },
};

/**
 * Simple API Client for services
 * Provides direct HTTP methods
 */
async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new APIError(
        response.status,
        await response.json(),
        "PATCH request failed",
      );
    }

    return response.json();
  } catch (error) {
    handleErrorResponse(error);
  }
}

async function upload<T>(endpoint: string, file: File | Blob): Promise<T> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new APIError(
        response.status,
        await response.json(),
        "Upload request failed",
      );
    }

    return response.json();
  } catch (error) {
    handleErrorResponse(error);
  }
}

const apiClient = {
  get,
  post,
  put,
  patch,
  delete: delete_,
  upload,
};

export { apiClient };
export default API;
