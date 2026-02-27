import { z } from "zod";

export const createOrganizationSchema = z
  .object({
    tenantId: z.string().min(1).optional(),
    userId: z.string().min(1).optional(),
    organizationName: z.string().min(1),
    organizationSize: z.number().int().min(1).max(10_000_000).optional(),
    organizationWebsite: z.url("Please provide valid website link"),
    organizationIndustry: z.enum(["Software", "Textile", "Foods", "Others"]),
  })
  .strict();

export const updateOrganizationSchema = z
  .object({
    organizationName: z.string("wrong format").min(1).optional(),
    organizationSize: z.number("wrong org size").int().min(1).max(10_000_000).optional(),
    organizationWebsite: z.url("Please provide valid url").optional(),
    organizationIndustry: z
      .enum(["Software", "Textile", "Foods", "Others"])
      .optional(),
  })
  .strict();
