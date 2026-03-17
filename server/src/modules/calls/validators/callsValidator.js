import { z } from "zod";

export const createCallSchema = z
  .object({
    leadId: z.string().min(1),
    type: z.enum(["incoming", "outgoing"]),
    notes: z.string().max(250).optional(),
    status: z.enum(["completed", "missed", "no-answer", "voicemail"]),
    duration: z.number().int().min(1).max(1000).optional(),
  })
  .strict();

export const updateCallSchema = z
  .object({
    type: z.enum(["incoming", "outgoing"]).optional(),
    notes: z.string().max(250).optional(),
    status: z
      .enum(["completed", "missed", "no-answer", "voicemail"])
      .optional(),
    duration: z.number().int().min(1).max(1000).optional(),
  })
  .strict();
