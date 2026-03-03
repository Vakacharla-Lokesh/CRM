import { z } from "zod";

export const createDealSchema = z
  .object({
    leadId: z.string().min(1),
    organizationId: z.string().min(1),
    tenantId: z.string().min(1),
    userId: z.string().min(1),
    name: z.string().min(1).max(100),
    value: z.number().min(0).max(1_000_000).optional(),
    status: z.enum([
      "Prospecting",
      "Qualification",
      "Negotiation",
      "Ready to close",
      "Won",
      "Lost",
    ]),
  })
  .strict();

export const updateDealSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    value: z.number().min(0).max(1_000_000).optional(),
    status: z
      .enum([
        "Prospecting",
        "Qualification",
        "Negotiation",
        "Ready to close",
        "Won",
        "Lost",
      ])
      .optional(),
  })
  .strict();

export const updateDealStatusSchema = z
  .object({
    status: z.enum([
      "Prospecting",
      "Qualification",
      "Negotiation",
      "Ready to close",
      "Won",
      "Lost",
    ]),
  })
  .strict();
