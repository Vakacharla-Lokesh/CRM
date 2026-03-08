// server/src/validators/pipelineValidator.js
import { z } from "zod";

const statusStageSchema = z.object({
  label: z.string().min(1).max(50).trim(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color")
    .default("#6366f1"),
  order: z.number().int().min(0),
});

// "Converted" must always be one of the stages
const mustContainConverted = (statuses) =>
  statuses.some((s) => s.label.toLowerCase() === "converted");

export const createPipelineSchema = z
  .object({
    name: z.string().min(1).max(100).trim(),
    statuses: z
      .array(statusStageSchema)
      .min(2, "A pipeline must have at least 2 stages")
      .refine(mustContainConverted, {
        message: 'A pipeline must include a "Converted" stage',
      }),
  })
  .strict();

export const updatePipelineSchema = z
  .object({
    name: z.string().min(1).max(100).trim().optional(),
    statuses: z
      .array(statusStageSchema)
      .min(2, "A pipeline must have at least 2 stages")
      .refine(mustContainConverted, {
        message: 'A pipeline must include a "Converted" stage',
      })
      .optional(),
  })
  .strict();
