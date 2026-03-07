import { apiClient } from "./core";
import type {
  Workflow,
  WorkflowListResponse,
  WorkflowExecutionLog,
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
} from "../../types/workflows";

export const workflowsAPI = {
  list: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<WorkflowListResponse> => {
    const queryParams: Record<string, unknown> = {
      limit: params?.limit ?? 20,
    };
    if (params?.cursor) queryParams.cursor = params.cursor;

    return apiClient.get<WorkflowListResponse>("/workflows", queryParams);
  },

  get: async (id: string): Promise<Workflow> => {
    const response = await apiClient.get<{ workflow: Workflow }>(
      `/workflows/${id}`,
    );
    return response.workflow;
  },

  create: async (data: CreateWorkflowDTO): Promise<Workflow> => {
    const response = await apiClient.post<{
      message: string;
      workflow: Workflow;
    }>("/workflows", data);
    return response.workflow;
  },

  update: async (id: string, data: UpdateWorkflowDTO, lastKnownUpdatedAt?: Date): Promise<Workflow> => {
    const response = await apiClient.put<{
      message: string;
      workflow: Workflow;
    }>(`/workflows/${id}`, {
      ...data,
      ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }),
    });
    return response.workflow;
  },

  toggle: async (
    id: string,
  ): Promise<{ message: string; isActive: boolean }> => {
    return apiClient.patch<{ message: string; isActive: boolean }>(
      `/workflows/${id}/toggle`,
      {},
    );
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/workflows/${id}`);
  },

  getLogs: async (
    id: string,
    limit?: number,
  ): Promise<{ count: number; logs: WorkflowExecutionLog[] }> => {
    const queryParams: Record<string, unknown> = {};
    if (limit) queryParams.limit = limit;
    return apiClient.get<{ count: number; logs: WorkflowExecutionLog[] }>(
      `/workflows/${id}/logs`,
      queryParams,
    );
  },
};
