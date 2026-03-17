import { useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import workflowService from "../services/workflowService";
import type { Workflow, CreateWorkflowDTO, UpdateWorkflowDTO } from "../types";
import { toast } from "sonner";

const PAGE_LIMIT = 20;

export const useWorkflowData = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");

  const {
    data,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["workflows"],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const page = await workflowService.getAllWorkflows({
        cursor: pageParam ?? undefined,
        limit: PAGE_LIMIT,
      });
      return page;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });

  const allWorkflows: Workflow[] = useMemo(
    () => data?.pages.flatMap((page) => page.workflows) ?? [],
    [data],
  );

  const filteredWorkflows: Workflow[] = useMemo(() => {
    if (!searchQuery.trim()) return allWorkflows;
    const q = searchQuery.toLowerCase();
    return allWorkflows.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.description?.toLowerCase().includes(q) ||
        w.trigger.entity.toLowerCase().includes(q) ||
        w.trigger.action.toLowerCase().includes(q),
    );
  }, [allWorkflows, searchQuery]);

  const createMutation = useMutation({
    mutationFn: (data: CreateWorkflowDTO) =>
      workflowService.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to create workflow";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      lastKnownUpdatedAt,
    }: {
      id: string;
      data: UpdateWorkflowDTO;
      lastKnownUpdatedAt?: Date;
    }) => workflowService.updateWorkflow(id, data, lastKnownUpdatedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (err: unknown) => {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        toast.error(
          "This workflow was modified by someone else. Please refresh and try again.",
        );
        queryClient.invalidateQueries({ queryKey: ["workflows"] });
        return;
      }
      const msg =
        err instanceof Error ? err.message : "Failed to update workflow";
      toast.error(msg);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      id,
      lastKnownUpdatedAt,
    }: {
      id: string;
      lastKnownUpdatedAt?: Date;
    }) => workflowService.toggleWorkflow(id, lastKnownUpdatedAt),
    onMutate: async ({
      id,
      lastKnownUpdatedAt: _lastKnownUpdatedAt,
    }: {
      id: string;
      lastKnownUpdatedAt?: Date;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["workflows"] });
      const previous = queryClient.getQueryData(["workflows"]);
      // Optimistic update
      queryClient.setQueryData(["workflows"], (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            workflows: page.workflows.map((w) =>
              w._id === id ? { ...w, isActive: !w.isActive } : w,
            ),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["workflows"], context?.previous);
      const status = (_err as { status?: number }).status;
      if (status === 409) {
        toast.error(
          "This workflow was modified by someone else. Please refresh and try again.",
        );
        queryClient.invalidateQueries({ queryKey: ["workflows"] });
        return;
      }
      const msg =
        _err instanceof Error ? _err.message : "Failed to toggle workflow";
      toast.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workflowService.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to delete workflow";
      toast.error(msg);
    },
  });

  const createWorkflow = (data: CreateWorkflowDTO) =>
    createMutation.mutateAsync(data);

  const updateWorkflow = (id: string, data: UpdateWorkflowDTO) => {
    const cachedWorkflow = allWorkflows.find((w) => w._id === id);
    return updateMutation.mutateAsync({
      id,
      data,
      lastKnownUpdatedAt: cachedWorkflow?.updatedAt
        ? new Date(cachedWorkflow.updatedAt)
        : undefined,
    });
  };

  const toggleWorkflow = (id: string, lastKnownUpdatedAt?: Date) => {
    const cachedWorkflow = allWorkflows.find((w) => w._id === id);
    return toggleMutation.mutate({
      id,
      lastKnownUpdatedAt:
        lastKnownUpdatedAt ||
        (cachedWorkflow?.updatedAt
          ? new Date(cachedWorkflow.updatedAt)
          : undefined),
    });
  };

  const deleteWorkflow = (id: string) => deleteMutation.mutateAsync(id);

  const searchWorkflows = (q: string) => setSearchQuery(q);

  return {
    // Data
    workflows: filteredWorkflows,
    allWorkflows,
    // Loading states
    loading,
    loadingMore,
    error: queryError,
    // Mutation states
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
    // Pagination
    hasNextPage,
    loadMore: fetchNextPage,
    refetch,
    // Search
    searchQuery,
    searchWorkflows,
    // CRUD
    createWorkflow,
    updateWorkflow,
    toggleWorkflow,
    deleteWorkflow,
  };
};
