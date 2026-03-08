import { apiClient } from "./core";
import type {
  Pipeline,
  CreatePipelineDTO,
  UpdatePipelineDTO,
} from "@/types/pipeline";

export const pipelinesAPI = {
  getAll: async (): Promise<Pipeline[]> => {
    const response = await apiClient.get<{
      count: number;
      pipelines: Pipeline[];
    }>("/pipelines");
    return response.pipelines;
  },

  getById: async (id: string): Promise<Pipeline> => {
    const response = await apiClient.get<{ pipeline: Pipeline }>(
      `/pipelines/${id}`,
    );
    return response.pipeline;
  },

  create: async (dto: CreatePipelineDTO): Promise<Pipeline> => {
    const response = await apiClient.post<{
      message: string;
      pipeline: Pipeline;
    }>("/pipelines", dto);
    return response.pipeline;
  },

  update: async (id: string, dto: UpdatePipelineDTO): Promise<Pipeline> => {
    const response = await apiClient.put<{
      message: string;
      pipeline: Pipeline;
    }>(`/pipelines/${id}`, dto);
    return response.pipeline;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/pipelines/${id}`);
  },

  setDefault: async (id: string): Promise<Pipeline> => {
    const response = await apiClient.patch<{
      message: string;
      pipeline: Pipeline;
    }>(`/pipelines/${id}/set-default`);
    return response.pipeline;
  },
};
