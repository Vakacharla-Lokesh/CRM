/* eslint_disable @typescript-eslint/no-empty-object-type */

import { get, post, put, delete_ } from "./core";
import type {
  Lead,
  LeadListResponse,
  CreateLeadDTO,
  UpdateLeadDTO,
} from "../../types";

export interface CursorLeadListResponse {
  leads: Lead[];
  count: number;
  nextCursor: string | null;
  hasNextPage: boolean;
}

export type OffsetLeadListResponse = LeadListResponse;

export interface LeadListParams {
  page?: number;
  limit?: number;

  cursor?: string | null;

  status?: string;
  organizationId?: string;
  userId?: string;
  search?: string;
}

export const leadsAPI = {
  list: async (
    params?: LeadListParams,
  ): Promise<CursorLeadListResponse | OffsetLeadListResponse> => {
    const { cursor, ...rest } = params ?? {};

    const queryParams: Record<string, unknown> = { ...rest };

    if (cursor) queryParams.cursor = cursor;

    const response = await get<{
      count: number;
      leads: Lead[];
      nextCursor?: string | null;
      hasNextPage?: boolean;
    }>("/leads", queryParams);

    if ("nextCursor" in response || "hasNextPage" in response) {
      return {
        leads: response.leads,
        count: response.count,
        nextCursor: response.nextCursor ?? null,
        hasNextPage: response.hasNextPage ?? false,
      };
    }

    return {
      leads: response.leads,
      total: response.count,
      page: params?.page || 1,
      limit: params?.limit || response.count,
    };
  },

  get: async (id: string) => {
    const response = await get<{ lead: Lead }>(`/leads/${id}`);
    return response.lead;
  },

  create: async (data: CreateLeadDTO) => {
    const response = await post<{ message: string; lead: Lead }>(
      "/leads",
      data,
    );
    return response.lead;
  },

  update: async (
    id: string,
    data: UpdateLeadDTO,
    lastKnownUpdatedAt?: Date,
  ) => {
    const response = await put<{ message: string; lead: Lead }>(
      `/leads/${id}`,
      {
        ...data,
        ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }),
      },
    );
    return response.lead;
  },

  delete: (id: string) => delete_<void>(`/leads/${id}`),

  bulkCreate: (leads: CreateLeadDTO[]) =>
    post<{ created: number; failed: number }>("/leads/bulk", { leads }),

  bulkUpdate: (updates: Array<{ id: string; data: UpdateLeadDTO }>) =>
    put<{ updated: number; failed: number }>("/leads/bulk", { updates }),

  assignToUser: (leadId: string, userId: string) =>
    put<Lead>(`/leads/${leadId}/assign`, { userId }),

  scoreLeads: (leadIds: string[]) => post<Lead[]>("/leads/score", { leadIds }),

  getActivity: (
    leadId: string,
    params?: { page?: number; limit?: number; cursor?: string },
  ) => {
    const { cursor, ...rest } = params ?? {};
    const queryParams: Record<string, unknown> = { ...rest };
    if (cursor) queryParams.cursor = cursor;

    return get(`/leads/${leadId}/activity`, queryParams);
  },

  getByOrganization: async (organizationId: string) =>
    get<{ count: number; leads: Lead[] }>(
      `/leads/organization/${organizationId}`,
    ),
  
    runRfmSegmentation: async () =>
    post<{ success: boolean; count: number; message: string }>(
      "/leads/rfm/run",
      {},
    ),
};
