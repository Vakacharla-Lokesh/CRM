import { z } from "zod";

export const exportLeadsSchema = z.object({
  ids: z
    .array(z.string().min(1, "ID cannot be empty"))
    .optional()
    .refine((ids) => !ids || ids.length <= 10000, {
      message: "Cannot export more than 10,000 records at once",
    }),
});

export const exportOrganizationsSchema = z.object({
  ids: z
    .array(z.string().min(1, "ID cannot be empty"))
    .optional()
    .refine((ids) => !ids || ids.length <= 10000, {
      message: "Cannot export more than 10,000 records at once",
    }),
});

export const exportDealsSchema = z.object({
  ids: z
    .array(z.string().min(1, "ID cannot be empty"))
    .optional()
    .refine((ids) => !ids || ids.length <= 10000, {
      message: "Cannot export more than 10,000 records at once",
    }),
});

// Email export schemas
export const exportLeadsToEmailSchema = z.object({
  ids: z
    .array(z.string().min(1, "ID cannot be empty"))
    .min(1, "At least one ID is required")
    .refine((ids) => ids.length <= 10000, {
      message: "Cannot export more than 10,000 records at once",
    }),
  email: z.string().email("Valid email address is required"),
});

export const exportOrganizationsToEmailSchema = z.object({
  ids: z
    .array(z.string().min(1, "ID cannot be empty"))
    .min(1, "At least one ID is required")
    .refine((ids) => ids.length <= 10000, {
      message: "Cannot export more than 10,000 records at once",
    }),
  email: z.string().email("Valid email address is required"),
});

export const exportDealsToEmailSchema = z.object({
  ids: z
    .array(z.string().min(1, "ID cannot be empty"))
    .min(1, "At least one ID is required")
    .refine((ids) => ids.length <= 10000, {
      message: "Cannot export more than 10,000 records at once",
    }),
  email: z.string().email("Valid email address is required"),
});
