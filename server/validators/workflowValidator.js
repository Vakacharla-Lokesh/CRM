import { z } from "zod";

const conditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum([
    "equals",
    "gte",
    "lte",
    "contains",
    "startsWith",
    "isEmpty",
    "isNotEmpty",
  ]),
  value: z.unknown().optional(),
});

const actionSchema = z.object({
  type: z.enum([
    "send_email",
    "update_field",
    "create_task",
    "webhook",
    "export_s3",
  ]),
  // send_email fields
  emailTemplate: z.string().optional(),
  recipient: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  // update_field fields
  targetField: z.string().optional(),
  value: z.unknown().optional(),
  // webhook fields
  webhookUrl: z.string().url().optional(),
  method: z.enum(["POST", "PUT"]).optional(),
  payload: z.unknown().optional(),
  // export_s3 fields
  format: z.enum(["csv", "json"]).optional(),
  bucket: z.string().optional(),
  prefix: z.string().optional(),
});

export const createWorkflowSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  trigger: z.object({
    entity: z.enum(["lead", "deal", "organization", "call", "comment"]),
    action: z.enum(["create", "update", "delete"]),
    conditions: z.array(conditionSchema).optional(),
  }),
  actions: z.array(actionSchema).min(1),
  schedule: z
    .object({
      enabled: z.boolean(),
      cronExpression: z.string().optional(),
    })
    .optional(),
});

export const updateWorkflowSchema = createWorkflowSchema.partial();
