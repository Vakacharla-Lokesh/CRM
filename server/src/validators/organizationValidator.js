import { z } from "zod";

export const createOrganizationSchema = z
  .object({
    tenantId: z.string().min(1).optional(),
    userId: z.string().min(1).optional(),
    name: z.string().min(1),
    size: z.number().int().min(1).max(10_000_000).optional(),
    website: z.url("Please provide valid website link"),
    industry: z.enum(["Software", "Textile", "Foods", "Others"]),
    city: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
  })
  .strict();

export const updateOrganizationSchema = z
  .object({
    name: z.string("wrong format").min(1).optional(),
    size: z
      .number("wrong org size")
      .int()
      .min(1)
      .max(10_000_000)
      .optional(),
    website: z.url("Please provide valid url").optional(),
    industry: z
      .enum(["Software", "Textile", "Foods", "Others"])
      .optional(),
    city: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
  })
  .strict();
