import { apiClient } from "./core";

export interface Task {
  _id: string;
  tenantId: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "in_review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  relationType?: "lead" | "deal" | "organization" | null;
  relationId?: string | null;
  dueDate?: string | null;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  relationType?: Task["relationType"];
  relationId?: string | null;
  dueDate?: string | null;
  assignedTo?: string | null;
}

export type UpdateTaskDTO = Partial<CreateTaskDTO>;

export const tasksAPI = {
  getAll: async (): Promise<Task[]> => {
    const response = await apiClient.get<{ tasks: Task[] }>("/tasks");
    return response.tasks;
  },
  getById: async (id: string): Promise<Task> => {
    const response = await apiClient.get<{ task: Task }>(`/tasks/${id}`);
    return response.task;
  },
  create: async (dto: CreateTaskDTO): Promise<Task> => {
    const response = await apiClient.post<{ task: Task }>("/tasks", dto);
    return response.task;
  },
  update: async (id: string, dto: UpdateTaskDTO, lastKnownUpdatedAt?: Date): Promise<Task> => {
    const response = await apiClient.put<{ task: Task }>(`/tasks/${id}`, {
      ...dto,
      ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }),
    });
    return response.task;
  },
  updateStatus: async (id: string, status: Task["status"], lastKnownUpdatedAt?: Date): Promise<Task> => {
    const response = await apiClient.patch<{ task: Task }>(
      `/tasks/${id}/status`,
      { status, ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }) },
    );
    return response.task;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
