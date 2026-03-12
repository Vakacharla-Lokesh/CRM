import type { CreateTaskDTO } from "@/services/api/tasks.api";

export const EMPTY_FORM: CreateTaskDTO = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  relationType: null,
  relationId: null,
  dueDate: null,
  assignedTo: null,
};
