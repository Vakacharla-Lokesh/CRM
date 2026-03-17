import { apiClient } from "./api/core";
import type {
  Workflow,
  WorkflowListResponse,
  WorkflowExecutionLog,
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
} from "../types/workflows";

const workflowService = {
  getAllWorkflows: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<WorkflowListResponse> => {
    const queryParams: Record<string, unknown> = {
      limit: params?.limit ?? 20,
    };
    if (params?.cursor) queryParams.cursor = params.cursor;

    return apiClient.get<WorkflowListResponse>("/workflows", queryParams);
  },

  getWorkflowById: async (id: string): Promise<Workflow> => {
    const response = await apiClient.get<{ workflow: Workflow }>(
      `/workflows/${id}`,
    );
    return response.workflow;
  },

  createWorkflow: async (data: CreateWorkflowDTO): Promise<Workflow> => {
    const response = await apiClient.post<{
      message: string;
      workflow: Workflow;
    }>("/workflows", data);
    return response.workflow;
  },

  updateWorkflow: async (
    id: string,
    data: UpdateWorkflowDTO,
    lastKnownUpdatedAt?: Date,
  ): Promise<Workflow> => {
    const response = await apiClient.put<{
      message: string;
      workflow: Workflow;
    }>(`/workflows/${id}`, {
      ...data,
      ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }),
    });
    return response.workflow;
  },

  toggleWorkflow: async (
    id: string,
    lastKnownUpdatedAt?: Date,
  ): Promise<{ message: string; isActive: boolean }> => {
    return apiClient.patch<{ message: string; isActive: boolean }>(
      `/workflows/${id}/toggle`,
      {
        ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }),
      },
    );
  },

  deleteWorkflow: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/workflows/${id}`);
  },

  getWorkflowLogs: async (
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

export default workflowService;
