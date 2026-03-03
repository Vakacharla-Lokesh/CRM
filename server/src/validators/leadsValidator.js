import { z } from "zod";

export const createLeadSchema = z.object({
  organizationId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  firstName: z.string().min(1),
  lastName: z.string().nullable().optional(),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format").or(z.literal("")).optional(),
  source: z
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
  score: z.number().min(0).max(100).optional(),
  status: z.enum(["New", "Converted", "Dead", "Follow-Up"]),
});

export const updateLeadSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional(),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format").or(z.literal("")).optional(),
    source: z
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
    score: z.number().min(0).max(100).optional(),
    status: z.enum(["New", "Converted", "Dead", "Follow-Up"]).optional(),
  });

export const updateLeadStatusSchema = z
  .object({
    status: z.enum(["New", "Converted", "Dead", "Follow-Up"]),
  })
  .strict();

export const updateLeadScoreSchema = z
  .object({
    score: z.number().min(0).max(100),
  })
  .strict();

export const convertLeadSchema = z
  .object({
    dealValue: z.number().min(0).max(1_000_000).optional(),
    dealStatus: z
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
