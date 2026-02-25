import { get, post, delete_ } from "./core";
import type { Attachment, CreateAttachmentDTO } from "../../types";
import { API_BASE_URL, getToken } from "./core";

export const attachmentsAPI = {
  list: async (params?: { page?: number; limit?: number }) => {
    const response = await get<{ count: number; attachments: Attachment[] }>(
      "/attachments",
      params,
    );
    return {
      attachments: response.attachments,
      total: response.count,
      page: params?.page || 1,
      limit: params?.limit || response.count,
    };
  },

  get: async (id: string) => {
    const response = await get<{ attachment: Attachment }>(
      `/attachments/${id}`,
    );
    return response.attachment;
  },

  getByLead: async (leadId: string) => {
    const response = await get<{ count: number; attachments: Attachment[] }>(
      `/attachments/lead/${leadId}`,
    );
    return {
      attachments: response.attachments,
      total: response.count,
    };
  },

  create: async (data: CreateAttachmentDTO) => {
    const response = await post<{ message: string; attachment: Attachment }>(
      "/attachments",
      data,
    );
    return response.attachment;
  },

  delete: (id: string) => delete_<{ message: string }>(`/attachments/${id}`),

  download: async (id: string): Promise<Blob> => {
    const token = getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/attachments/${id}/download`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to download attachment");
    }

    return response.blob();
  },
};
