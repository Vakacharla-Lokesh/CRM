import { get, post, getToken } from "./core";
import { API_BASE_URL } from "./core";

export const bulkAPI = {
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

  sync: () => post<{ synced: number; failed: number }>("/bulk/sync", {}),
};
