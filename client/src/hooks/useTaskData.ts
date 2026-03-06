import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tasksAPI,
  type CreateTaskDTO,
  type UpdateTaskDTO,
  type Task,
} from "@/services/api/tasks.api";

const TASKS_KEY = ["tasks"] as const;

export function useTaskData() {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: TASKS_KEY,
    queryFn: tasksAPI.getAll,
  });

  const createTask = useMutation({
    mutationFn: (dto: CreateTaskDTO) => tasksAPI.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDTO }) =>
      tasksAPI.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const updateTaskStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task["status"] }) =>
      tasksAPI.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(
        TASKS_KEY,
        (old) => old?.map((t) => (t._id === id ? { ...t, status } : t)) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_KEY, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => tasksAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
}
