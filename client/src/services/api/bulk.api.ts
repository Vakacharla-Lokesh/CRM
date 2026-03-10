import { get, post, upload } from "./core";
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

interface BulkDeleteResponse {
  message: string;
  totalRequested: number;
  totalDeleted: number;
  failedIds: string[];
  errors?: Array<{ index: number; error: string; delete: unknown }>;
}

interface BulkImportResponse {
  message: string;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export const bulkAPI = {
  // Export/Import
  export: (entityType: string, params?: { format?: "csv" | "json" }) =>
    get(`/bulk/export/${entityType}`, params),

  import: async (entityType: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};

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

  deleteLeads: (ids: string[]) =>
    post<BulkDeleteResponse>("/bulk/leads/delete", { ids }),
  
  importLeads: (file: File) =>
    upload<BulkImportResponse>("/bulk/leads/import", file),

  // Bulk Deals
  createDeals: <T>(deals: unknown[]) =>
    post<BulkCreateResponse<T>>("/bulk/deals/create", { deals }),

  updateDeals: <T>(updates: Array<{ id: string } & Record<string, unknown>>) =>
    post<BulkUpdateResponse<T>>("/bulk/deals/update", { updates }),

  deleteDeals: (ids: string[]) =>
    post<BulkDeleteResponse>("/bulk/deals/delete", { ids }),

  importDeals: (file: File) =>
    upload<BulkImportResponse>("/bulk/deals/import", file),
  // Bulk Comments
  createComments: <T>(comments: unknown[]) =>
    post<BulkCreateResponse<T>>("/bulk/comments/create", { comments }),

  // Bulk Calls
  createCalls: <T>(calls: unknown[]) =>
    post<BulkCreateResponse<T>>("/bulk/calls/create", { calls }),

  // Bulk Organizations
  createOrganizations: <T>(organizations: unknown[]) =>
    post<BulkCreateResponse<T>>("/bulk/organizations/create", {
      organizations,
    }),

  updateOrganizations: <T>(
    updates: Array<{ id: string } & Record<string, unknown>>,
  ) => post<BulkUpdateResponse<T>>("/bulk/organizations/update", { updates }),

  deleteOrganizations: (ids: string[]) =>
    post<BulkDeleteResponse>("/bulk/organizations/delete", { ids }),

  importOrganizations: (file: File) =>
    upload<BulkImportResponse>("/bulk/organizations/import", file),

  sync: () => post<{ synced: number; failed: number }>("/bulk/sync", {}),
};
