import { get, post, put, delete_ } from "./core";
import type { Call, CreateCallDTO, UpdateCallDTO } from "../../types";

export const callsAPI = {
  list: async (params?: { page?: number; limit?: number }) => {
    const response = await get<{ count: number; calls: Call[] }>(
      "/calls",
      params,
    );
    return {
      calls: response.calls,
      total: response.count,
      page: params?.page || 1,
      limit: params?.limit || response.count,
    };
  },

  get: async (id: string) => {
    const response = await get<{ call: Call }>(`/calls/${id}`);
    return response.call;
  },

  getByLead: async (leadId: string) => {
    const response = await get<{ count: number; calls: Call[] }>(
      `/calls/lead/${leadId}`,
    );
    return {
      calls: response.calls,
      total: response.count,
    };
  },

  create: async (data: CreateCallDTO) => {
    const response = await post<{ message: string; call: Call }>(
      "/calls",
      data,
    );
    return response.call;
  },

  update: async (id: string, data: UpdateCallDTO, lastKnownUpdatedAt?: Date) => {
    const response = await put<{ message: string; call: Call }>(
      `/calls/${id}`,
      {
        ...data,
        ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }),
      },
    );
    return response.call;
  },

  delete: (id: string) => delete_<{ message: string }>(`/calls/${id}`),
};
