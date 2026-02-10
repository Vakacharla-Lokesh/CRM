import { z } from "zod";

export const createLeadSchema = z.object({
  organizationId: z.string().min(1),
  userId: z.string().min(1),
  tenantId: z.string().optional(),

  leadFirstName: z.string().min(1),
  leadLastName: z.string().nullable().optional(),

  leadEmail: z.string().email("Invalid email format").optional(),

  leadSource: z.enum(["API", "Outsource"]).optional(),

  leadScore: z.number().min(0).max(100).optional(),

  leadStatus: z.enum(["New", "Converted", "Dead", "Follow-Up"]),
});

export const updateLeadSchema = z
  .object({
    leadFirstName: z.string().min(1).optional(),
    leadLastName: z.string().optional(),
    leadEmail: z.email().optional(),
    leadSource: z.enum(["API", "Outsource"]).optional(),
    leadScore: z.number().min(0).max(100).optional(),
    leadStatus: z.enum(["New", "Converted", "Dead", "Follow-Up"]).optional(),
    organizationId: z.string().optional(),
  })
  .strict();

export const updateLeadStatusSchema = z
  .object({
    leadStatus: z.enum(["New", "Converted", "Dead", "Follow-Up"]),
  })
  .strict();

export const updateLeadScoreSchema = z
  .object({
    leadScore: z.number().min(0).max(100),
  })
  .strict();
