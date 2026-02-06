import { z } from "zod";

export const createDealSchema = z
  .object({
    leadId: z.string().min(1),
    organizationId: z.string().min(1),
    tenantId: z.string().min(1),
    userId: z.string().min(1),
    dealName: z.string().min(1).max(100),
    dealValue: z.number().min(0).max(1_000_000).optional(),
    dealStatus: z.enum([
      "Prospecting",
      "Qualification",
      "Negotiation",
      "Ready to close",
      "Won",
      "Lost",
    ]),
  })
  .strict();
