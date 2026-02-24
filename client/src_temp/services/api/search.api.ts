import { get } from "./core";

export const searchAPI = {
  global: (query: string, limit?: number) =>
    get("/search", { q: query, limit }),

  leads: (query: string, params?: Record<string, unknown>) =>
    get("/search/leads", { q: query, ...params }),

  organizations: (query: string, params?: Record<string, unknown>) =>
    get("/search/organizations", { q: query, ...params }),
};
