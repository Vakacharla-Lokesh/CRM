import { get, post, getToken } from "./core";
import { API_BASE_URL } from "./core";

interface BulkCreateResponse<T> {
  message: string;
  created: number;
  failed: number;
  items: T[];
  errors?: Array<{ index: number; error: string; item: unknown }>;
}

interface BulkUpdateResponse<T> {
  message: string;
  updated: number;
  failed: number;
  items: T[];
  errors?: Array<{ index: number; error: string; update: unknown }>;
}

export const bulkAPI = {
  // Export/Import
  export: (entityType: string, params?: { format?: "csv" | "json" }) =>
    get(`/bulk/export/${entityType}`, params),

  import: (entityType: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}/bulk/import/${entityType}`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Import failed");
      }
      return response.json();
    });
  },

  // Bulk Leads
  createLeads: <T>(leads: unknown[]) =>
    post<BulkCreateResponse<T>>("/bulk/leads/create", { leads }),

  updateLeads: <T>(updates: Array<{ id: string } & Record<string, unknown>>) =>
    post<BulkUpdateResponse<T>>("/bulk/leads/update", { updates }),

  // Bulk Deals
  createDeals: <T>(deals: unknown[]) =>
    post<BulkCreateResponse<T>>("/bulk/deals/create", { deals }),

  updateDeals: <T>(updates: Array<{ id: string } & Record<string, unknown>>) =>
    post<BulkUpdateResponse<T>>("/bulk/deals/update", { updates }),

  // Bulk Comments
  createComments: <T>(comments: unknown[]) =>
    post<BulkCreateResponse<T>>("/bulk/comments/create", { comments }),

  // Bulk Calls
  createCalls: <T>(calls: unknown[]) =>
    post<BulkCreateResponse<T>>("/bulk/calls/create", { calls }),

  // Legacy sync endpoint
  sync: () => post<{ synced: number; failed: number }>("/bulk/sync", {}),
};
