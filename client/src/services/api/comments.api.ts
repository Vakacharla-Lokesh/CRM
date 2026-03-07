import { get, post, put, delete_ } from "./core";
import type { Comment, CreateCommentDTO, UpdateCommentDTO } from "../../types";

export const commentsAPI = {
  list: async (params?: { page?: number; limit?: number }) => {
    const response = await get<{ count: number; comments: Comment[] }>(
      "/comments",
      params,
    );
    return {
      comments: response.comments,
      total: response.count,
      page: params?.page || 1,
      limit: params?.limit || response.count,
    };
  },

  get: async (id: string) => {
    const response = await get<{ comment: Comment }>(`/comments/${id}`);
    return response.comment;
  },

  getByLead: async (leadId: string) => {
    const response = await get<{ count: number; comments: Comment[] }>(
      `/comments/lead/${leadId}`,
    );
    return {
      comments: response.comments,
      total: response.count,
    };
  },

  create: async (data: CreateCommentDTO) => {
    const response = await post<{ message: string; comment: Comment }>(
      "/comments",
      data,
    );
    return response.comment;
  },

  update: async (id: string, data: UpdateCommentDTO, lastKnownUpdatedAt?: Date) => {
    const response = await put<{ message: string; comment: Comment }>(
      `/comments/${id}`,
      {
        ...data,
        ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }),
      },
    );
    return response.comment;
  },

  delete: (id: string) => delete_<{ message: string }>(`/comments/${id}`),
};
