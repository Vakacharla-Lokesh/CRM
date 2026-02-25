import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment, CreateCommentDTO, UpdateCommentDTO } from "../types";
import { commentsAPI } from "../services";

export const useCommentData = (leadId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["comments", "lead", leadId];

  // ─── Main query ──────────────────────────────────────────────────────
  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey,
    queryFn: () => commentsAPI.getByLead(leadId),
    enabled: !!leadId,
    staleTime: 30_000,
    select: (res) => res.comments,
  });

  const comments: Comment[] = data ?? [];
  const error = queryError instanceof Error ? queryError.message : null;

  // ─── Create ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (commentData: Omit<CreateCommentDTO, "leadId">) =>
      commentsAPI.create({ ...commentData, leadId }),
    onSuccess: (newComment) => {
      // Prepend to cache — newest comments appear at top
      queryClient.setQueryData<Comment[]>(queryKey, (prev = []) => [
        newComment,
        ...prev,
      ]);
    },
    onError: (err) => {
      console.error("Error creating comment:", err);
    },
  });

  // ─── Update ──────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentDTO }) =>
      commentsAPI.update(id, data),
    onSuccess: (updatedComment) => {
      queryClient.setQueryData<Comment[]>(queryKey, (prev = []) =>
        prev.map((c) => (c._id === updatedComment._id ? updatedComment : c)),
      );
    },
    onError: (err) => {
      console.error("Error updating comment:", err);
    },
  });

  // ─── Delete ──────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentsAPI.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Comment[]>(queryKey, (prev = []) =>
        prev.filter((c) => c._id !== id),
      );
    },
    onError: (err) => {
      console.error("Error deleting comment:", err);
    },
  });

  // ─── Convenience wrappers (preserve old API surface) ─────────────────
  const createComment = useCallback(
    (data: Omit<CreateCommentDTO, "leadId">) =>
      createMutation.mutateAsync(data),
    [createMutation],
  );

  const updateComment = useCallback(
    (id: string, data: UpdateCommentDTO) =>
      updateMutation.mutateAsync({ id, data }),
    [updateMutation],
  );

  const deleteComment = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, leadId]);

  // ─── Return (identical shape to old hook) ─────────────────────────────
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
