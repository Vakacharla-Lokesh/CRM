import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Call, CreateCallDTO, UpdateCallDTO } from "@/types";
import { callsAPI } from "@/services/api/";

export const useCallData = (leadId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["calls", "lead", leadId];

  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey,
    queryFn: () => callsAPI.getByLead(leadId),
    enabled: !!leadId,
    staleTime: 30_000,
    select: (res) => res.calls,
  });

  const calls: Call[] = data ?? [];
  const error = queryError instanceof Error ? queryError.message : null;

  const createMutation = useMutation({
    mutationFn: (callData: Omit<CreateCallDTO, "leadId">) =>
      callsAPI.create({ ...callData, leadId }),
    onSuccess: (newCall) => {
      queryClient.setQueryData<{ calls: Call[]; total: number }>(
        queryKey,
        (prev) => ({
          calls: [newCall, ...(prev?.calls ?? [])],
          total: (prev?.total ?? 0) + 1,
        }),
      );
    },
    onError: (err) => {
      console.error("Error creating call:", err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCallDTO }) =>
      callsAPI.update(id, data),
    onSuccess: (updatedCall) => {
      queryClient.setQueryData<{ calls: Call[]; total: number }>(
        queryKey,
        (prev) => ({
          calls: (prev?.calls ?? []).map((c) =>
            c._id === updatedCall._id ? updatedCall : c,
          ),
          total: prev?.total ?? 0,
        }),
      );
    },
    onError: (err) => {
      console.error("Error updating call:", err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => callsAPI.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<{ calls: Call[]; total: number }>(
        queryKey,
        (prev) => ({
          calls: (prev?.calls ?? []).filter((c) => c._id !== id),
          total: Math.max(0, (prev?.total ?? 1) - 1),
        }),
      );
    },
    onError: (err) => {
      console.error("Error deleting call:", err);
    },
  });

  const createCall = useCallback(
    (data: Omit<CreateCallDTO, "leadId">) => createMutation.mutateAsync(data),
    [createMutation],
  );

  const updateCall = useCallback(
    (id: string, data: UpdateCallDTO) =>
      updateMutation.mutateAsync({ id, data }),
    [updateMutation],
  );

  const deleteCall = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, leadId]);

  return {
    calls,
    loading,
    error,
    createCall,
    updateCall,
    deleteCall,
    refresh,
  };
};
