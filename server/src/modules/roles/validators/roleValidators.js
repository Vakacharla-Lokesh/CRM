import { z } from "zod";
import { ALL_PERMISSIONS } from "../../../utils/permissionPresets.js";

const permissionStringSchema = z
  .string()
  .refine((p) => ALL_PERMISSIONS.includes(p), {
    message: "Invalid permission string",
  });

export const createRoleSchema = z
  .object({
    name: z.string().min(1, "Role name is required").max(100),
    description: z.string().max(500).optional(),
    permissions: z.array(permissionStringSchema).default([]),
  })
  .strict();

export const updateRoleSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    permissions: z.array(permissionStringSchema).optional(),
  })
  .strict();
