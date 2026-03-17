import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pipelinesAPI } from "@/services/api/pipelines.api";
import type {
  CreatePipelineDTO,
  UpdatePipelineDTO,
  Pipeline,
} from "@/types/pipeline";

const PIPELINES_KEY = ["pipelines"] as const;

export function usePipelineData() {
  const queryClient = useQueryClient();

  const {
    data: pipelines = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: PIPELINES_KEY,
    queryFn: pipelinesAPI.getAll,
    staleTime: 1000 * 60 * 5, // 5 min — pipelines change infrequently
  });

  // Derived: the default pipeline
  const defaultPipeline: Pipeline | undefined = pipelines.find(
    (p) => p.isDefault,
  );

  const createPipeline = useMutation({
    mutationFn: (dto: CreatePipelineDTO) => pipelinesAPI.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINES_KEY });
      toast.success("Pipeline created successfully!");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to create pipeline";
      toast.error(message);
    },
  });

  const updatePipeline = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePipelineDTO }) =>
      pipelinesAPI.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINES_KEY });
      toast.success("Pipeline updated successfully!");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to update pipeline";
      toast.error(message);
    },
  });

  const deletePipeline = useMutation({
    mutationFn: (id: string) => pipelinesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINES_KEY });
      toast.success("Pipeline deleted successfully!");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to delete pipeline";
      toast.error(message);
    },
  });

  const setDefaultPipeline = useMutation({
    mutationFn: (id: string) => pipelinesAPI.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINES_KEY });
      toast.success("Default pipeline updated!");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update default pipeline";
      toast.error(message);
    },
  });

  return {
    pipelines,
    defaultPipeline,
    isLoading,
    error,
    createPipeline,
    updatePipeline,
    deletePipeline,
    setDefaultPipeline,
  };
}
