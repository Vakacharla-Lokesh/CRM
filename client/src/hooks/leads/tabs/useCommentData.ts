import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment, CreateCommentDTO, UpdateCommentDTO } from "@/types";
import { commentsAPI } from "@/services/api/";

export const useCommentData = (leadId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["comments", "lead", leadId];

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

  const createMutation = useMutation({
    mutationFn: (commentData: Omit<CreateCommentDTO, "leadId">) =>
      commentsAPI.create({ ...commentData, leadId }),
    onSuccess: (newComment) => {
      queryClient.setQueryData<{ comments: Comment[]; total: number }>(
        queryKey,
        (prev) => ({
          comments: [newComment, ...(prev?.comments ?? [])],
          total: (prev?.total ?? 0) + 1,
        }),
      );
    },
    onError: (err) => {
      console.error("Error creating comment:", err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentDTO }) =>
      commentsAPI.update(id, data),
    onSuccess: (updatedComment) => {
      queryClient.setQueryData<{ comments: Comment[]; total: number }>(
        queryKey,
        (prev) => ({
          comments: (prev?.comments ?? []).map((c) =>
            c._id === updatedComment._id ? updatedComment : c,
          ),
          total: prev?.total ?? 0,
        }),
      );
    },
    onError: (err) => {
      console.error("Error updating comment:", err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentsAPI.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<{ comments: Comment[]; total: number }>(
        queryKey,
        (prev) => ({
          comments: (prev?.comments ?? []).filter((c) => c._id !== id),
          total: Math.max(0, (prev?.total ?? 1) - 1),
        }),
      );
    },
    onError: (err) => {
      console.error("Error deleting comment:", err);
    },
  });

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
