import { z } from "zod";

export const createLeadSchema = z.object({
  organizationId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  leadFirstName: z.string().min(1),
  leadLastName: z.string().nullable().optional(),
  leadEmail: z.email("Invalid email format").optional(),
  leadSource: z
    .enum([
      "API",
      "Outsource",
      "Phone",
      "Website",
      "Facebook Ads",
      "Google Ads",
      "Instagram",
      "LinkedIn",
      "Email Marketing",
      "Referral",
      "Cold Call",
      "WhatsApp",
      "Other",
    ])
    .optional(),
  leadScore: z.number().min(0).max(100).optional(),
  leadStatus: z.enum(["New", "Converted", "Dead", "Follow-Up"]),
});

export const updateLeadSchema = z
  .object({
    leadFirstName: z.string().min(1).optional(),
    leadLastName: z.string().optional(),
    leadEmail: z.email().optional(),
    leadSource: z
      .enum([
        "API",
        "Outsource",
        "Phone",
        "Website",
        "Facebook Ads",
        "Google Ads",
        "Instagram",
        "LinkedIn",
        "Email Marketing",
        "Referral",
        "Cold Call",
        "WhatsApp",
        "Other",
      ])
      .optional(),
    leadScore: z.number().min(0).max(100).optional(),
    leadStatus: z.enum(["New", "Converted", "Dead", "Follow-Up"]).optional(),
  });

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
