import { z } from "zod";

export const createOrganizationSchema = z
  .object({
    tenantId: z.string().min(1),
    userId: z.string().min(1),
    organizationName: z.string().min(1),
    organizationSize: z.number().int().min(1).max(10_000_000).optional(),
    organizationWebsite: z.string().url("Please provide valid website link"),
    organizationIndustry: z.enum(["Software", "Textile", "Foods", "Others"]),
  })
  .strict();
