import { z } from "zod";

export const createCommentSchema = z
  .object({
    leadId: z.string().min(1),
    commentTitle: z.string().min(1),
    commentDesc: z.string().optional(),
  })
  .strict();
