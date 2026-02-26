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

  // ── Fetch all workflows ─────────────────────────────────────────────────
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

  // ── Client-side search filter ───────────────────────────────────────────
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

  // ── Create ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateWorkflowDTO) =>
      workflowService.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create workflow";
      toast.error(msg);
    },
  });

  // ── Update ──────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowDTO }) =>
      workflowService.updateWorkflow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update workflow";
      toast.error(msg);
    },
  });

  // ── Toggle active ───────────────────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: (id: string) => workflowService.toggleWorkflow(id),
    onMutate: async (id: string) => {
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
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["workflows"], context?.previous);
      const msg = _err instanceof Error ? _err.message : "Failed to toggle workflow";
      toast.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

  // ── Delete ──────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => workflowService.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete workflow";
      toast.error(msg);
    },
  });

  // ── Exposed helpers ─────────────────────────────────────────────────────
  const createWorkflow = (data: CreateWorkflowDTO) =>
    createMutation.mutateAsync(data);

  const updateWorkflow = (id: string, data: UpdateWorkflowDTO) =>
    updateMutation.mutateAsync({ id, data });

  const toggleWorkflow = (id: string) => toggleMutation.mutate(id);

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
