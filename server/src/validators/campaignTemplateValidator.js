import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional().default(""),
  category: z
    .enum(["Onboarding", "Announcement", "Follow-Up", "Launch", "Custom"])
    .optional()
    .default("Custom"),
  subject: z.string().min(1).max(300),
  body: z.string().min(1),
});

export const updateTemplateSchema = createTemplateSchema.partial();
