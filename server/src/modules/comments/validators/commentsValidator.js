import { z } from "zod";

export const createCommentSchema = z
  .object({
    leadId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
  })
  .strict();

export const updateCommentSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .strict();
