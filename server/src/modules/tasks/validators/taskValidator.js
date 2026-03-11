import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  relationType: z.enum(["lead", "deal", "organization"]).nullable().optional(),
  relationId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assignedTo: z.string().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateTaskStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
});
