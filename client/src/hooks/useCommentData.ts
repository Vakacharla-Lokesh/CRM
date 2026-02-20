import { useState, useEffect, useCallback } from "react";
import type { Comment, CreateCommentDTO, UpdateCommentDTO } from "../types";
import { commentsAPI } from "../services";

export const useCommentData = (leadId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!leadId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await commentsAPI.getByLead(leadId);
      setComments(response.comments);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load comments";
      setError(message);
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  const createComment = useCallback(
    async (data: Omit<CreateCommentDTO, "leadId">) => {
      try {
        setError(null);
        const newComment = await commentsAPI.create({ ...data, leadId });
        setComments((prev) => [newComment, ...prev]);
        return newComment;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create comment";
        setError(message);
        console.error("Error creating comment:", err);
        throw err;
      }
    },
    [leadId],
  );

  const updateComment = useCallback(
    async (id: string, data: UpdateCommentDTO) => {
      try {
        setError(null);
        const updatedComment = await commentsAPI.update(id, data);
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === id ? updatedComment : comment,
          ),
        );
        return updatedComment;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update comment";
        setError(message);
        console.error("Error updating comment:", err);
        throw err;
      }
    },
    [],
  );

  const deleteComment = useCallback(async (id: string) => {
    try {
      setError(null);
      await commentsAPI.delete(id);
      setComments((prev) => prev.filter((comment) => comment._id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete comment";
      setError(message);
      console.error("Error deleting comment:", err);
      throw err;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    refresh,
  };
};
