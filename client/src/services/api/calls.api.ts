import { get, post, put, delete_ } from "./core";
import type { Call, CreateCallDTO, UpdateCallDTO } from "../../types";

export const callsAPI = {
  /**
   * Get all calls
   */
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

  /**
   * Get a specific call by ID
   */
  get: async (id: string) => {
    const response = await get<{ call: Call }>(`/calls/${id}`);
    return response.call;
  },

  /**
   * Get all calls for a specific lead
   */
  getByLead: async (leadId: string) => {
    const response = await get<{ count: number; calls: Call[] }>(
      `/calls/lead/${leadId}`,
    );
    return {
      calls: response.calls,
      total: response.count,
    };
  },

  /**
   * Create a new call
   */
  create: async (data: CreateCallDTO) => {
    const response = await post<{ message: string; call: Call }>(
      "/calls",
      data,
    );
    return response.call;
  },

  /**
   * Update an existing call
   */
  update: async (id: string, data: UpdateCallDTO) => {
    const response = await put<{ message: string; call: Call }>(
      `/calls/${id}`,
      data,
    );
    return response.call;
  },

  /**
   * Delete a call
   */
  delete: (id: string) => delete_<{ message: string }>(`/calls/${id}`),
};
