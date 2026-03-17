import { z } from "zod";

const LEAD_SOURCES = [
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
];

const LEAD_STATUSES = ["New", "Converted", "Dead", "Follow-Up"];

const DEAL_STATUSES = [
  "Prospecting",
  "Qualification",
  "Negotiation",
  "Ready to close",
  "Won",
  "Lost",
];

const ORG_INDUSTRIES = ["Software", "Textile", "Foods", "Others"];

const MAX_BULK_SIZE = 500;

// ─── Leads ────────────────────────────────────────────────────────────────────

const bulkLeadItemSchema = z.object({
  organizationId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
  firstName: z.string().min(1),
  lastName: z.string().nullable().optional(),
  email: z.email("Invalid email format").optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  score: z.number().min(0).max(100).optional(),
  status: z.enum(LEAD_STATUSES),
});

export const bulkCreateLeadsSchema = z
  .object({
    tenantId: z.string().optional(),
    operations: z
      .array(bulkLeadItemSchema)
      .min(1, "At least one operation is required")
      .max(
        MAX_BULK_SIZE,
        `Cannot bulk-create more than ${MAX_BULK_SIZE} items`,
      ),
  })
  .strict();

const bulkLeadUpdateItemSchema = z.object({
  id: z.string().min(1, "Lead id is required"),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  email: z.email().optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  score: z.number().min(0).max(100).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
});

export const bulkUpdateLeadsSchema = z
  .object({
    tenantId: z.string().optional(),
    operations: z
      .array(bulkLeadUpdateItemSchema)
      .min(1, "At least one operation is required")
      .max(
        MAX_BULK_SIZE,
        `Cannot bulk-update more than ${MAX_BULK_SIZE} items`,
      ),
  })
  .strict();

// ─── Deals ────────────────────────────────────────────────────────────────────

const bulkDealItemSchema = z.object({
  leadId: z.string().min(1),
  organizationId: z.string().min(1),
  tenantId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  name: z.string().min(1).max(100),
  value: z.number().min(0).max(1_000_000).optional(),
  status: z.enum(DEAL_STATUSES),
});

export const bulkCreateDealsSchema = z
  .object({
    tenantId: z.string().optional(),
    operations: z
      .array(bulkDealItemSchema)
      .min(1, "At least one operation is required")
      .max(
        MAX_BULK_SIZE,
        `Cannot bulk-create more than ${MAX_BULK_SIZE} items`,
      ),
  })
  .strict();

const bulkDealUpdateItemSchema = z.object({
  id: z.string().min(1, "Deal id is required"),
  name: z.string().min(1).max(100).optional(),
  value: z.number().min(0).max(1_000_000).optional(),
  status: z.enum(DEAL_STATUSES).optional(),
});

export const bulkUpdateDealsSchema = z
  .object({
    tenantId: z.string().optional(),
    operations: z
      .array(bulkDealUpdateItemSchema)
      .min(1, "At least one operation is required")
      .max(
        MAX_BULK_SIZE,
        `Cannot bulk-update more than ${MAX_BULK_SIZE} items`,
      ),
  })
  .strict();

// ─── Comments ─────────────────────────────────────────────────────────────────

const bulkCommentItemSchema = z.object({
  leadId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
});

export const bulkCreateCommentsSchema = z
  .object({
    tenantId: z.string().optional(),
    operations: z
      .array(bulkCommentItemSchema)
      .min(1, "At least one operation is required")
      .max(
        MAX_BULK_SIZE,
        `Cannot bulk-create more than ${MAX_BULK_SIZE} items`,
      ),
  })
  .strict();

// ─── Calls ────────────────────────────────────────────────────────────────────

const bulkCallItemSchema = z.object({
  leadId: z.string().min(1),
  type: z.enum(["incoming", "outgoing"]),
  notes: z.string().max(250).optional(),
  status: z.enum(["completed", "missed", "no-answer", "voicemail"]),
  duration: z.number().int().min(1).max(1000).optional(),
});

export const bulkCreateCallsSchema = z
  .object({
    tenantId: z.string().optional(),
    operations: z
      .array(bulkCallItemSchema)
      .min(1, "At least one operation is required")
      .max(
        MAX_BULK_SIZE,
        `Cannot bulk-create more than ${MAX_BULK_SIZE} items`,
      ),
  })
  .strict();

// ─── Organizations ────────────────────────────────────────────────────────────

const bulkOrganizationItemSchema = z.object({
  tenantId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  name: z.string().min(1),
  size: z.number().int().min(1).max(10_000_000).optional(),
  website: z.url("Please provide a valid website link"),
  industry: z.enum(ORG_INDUSTRIES),
});

export const bulkCreateOrganizationsSchema = z
  .object({
    tenantId: z.string().optional(),
    operations: z
      .array(bulkOrganizationItemSchema)
      .min(1, "At least one operation is required")
      .max(
        MAX_BULK_SIZE,
        `Cannot bulk-create more than ${MAX_BULK_SIZE} items`,
      ),
  })
  .strict();

const bulkOrganizationUpdateItemSchema = z.object({
  id: z.string().min(1, "Organization id is required"),
  name: z.string().min(1).optional(),
  size: z.number().int().min(1).max(10_000_000).optional(),
  website: z.url("Please provide a valid url").optional(),
  industry: z.enum(ORG_INDUSTRIES).optional(),
});

export const bulkUpdateOrganizationsSchema = z
  .object({
    tenantId: z.string().optional(),
    operations: z
      .array(bulkOrganizationUpdateItemSchema)
      .min(1, "At least one operation is required")
      .max(
        MAX_BULK_SIZE,
        `Cannot bulk-update more than ${MAX_BULK_SIZE} items`,
      ),
  })
  .strict();
