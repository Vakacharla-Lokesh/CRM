import { get, post, put, delete_ } from "./core";
import type { Comment, CreateCommentDTO, UpdateCommentDTO } from "../../types";

export const commentsAPI = {
  /**
   * Get all comments
   */
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

  /**
   * Get a specific comment by ID
   */
  get: async (id: string) => {
    const response = await get<{ comment: Comment }>(`/comments/${id}`);
    return response.comment;
  },

  /**
   * Get all comments for a specific lead
   */
  getByLead: async (leadId: string) => {
    const response = await get<{ count: number; comments: Comment[] }>(
      `/comments/lead/${leadId}`,
    );
    return {
      comments: response.comments,
      total: response.count,
    };
  },

  /**
   * Create a new comment
   */
  create: async (data: CreateCommentDTO) => {
    const response = await post<{ message: string; comment: Comment }>(
      "/comments",
      data,
    );
    return response.comment;
  },

  /**
   * Update an existing comment
   */
  update: async (id: string, data: UpdateCommentDTO) => {
    const response = await put<{ message: string; comment: Comment }>(
      `/comments/${id}`,
      data,
    );
    return response.comment;
  },

  /**
   * Delete a comment
   */
  delete: (id: string) => delete_<{ message: string }>(`/comments/${id}`),
};
