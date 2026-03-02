import { get, post, delete_ } from "./core";
import type {
  Attachment,
  CreateAttachmentDTO,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from "../../types";
import { API_BASE_URL } from "./core";

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

  // Step 1: Ask the server for a presigned PUT URL
  getPresignedUrl: async (
    data: PresignedUrlRequest,
  ): Promise<PresignedUrlResponse> => {
    return post<PresignedUrlResponse>("/attachments/presigned-url", data);
  },

  // Step 2a: Upload the file directly to S3 using the presigned URL
  uploadToS3: async (presignedUrl: string, file: File): Promise<void> => {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) {
      throw new Error(
        `S3 upload failed: ${response.status} ${response.statusText}`,
      );
    }
  },

  // Step 2b: Confirm the upload by saving metadata to the DB
  create: async (data: CreateAttachmentDTO) => {
    const response = await post<{ message: string; attachment: Attachment }>(
      "/attachments",
      data,
    );
    return response.attachment;
  },

  delete: (id: string) => delete_<{ message: string }>(`/attachments/${id}`),

  // Returns a fresh presigned GET URL from the server
  download: async (id: string): Promise<string> => {
    const headers: Record<string, string> = {};

    const response = await fetch(`${API_BASE_URL}/attachments/${id}/download`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to get download URL");
    }

    const data = await response.json();
    return data.url as string;
  },
};
