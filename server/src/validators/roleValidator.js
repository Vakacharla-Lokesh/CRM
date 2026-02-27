import { z } from "zod";
import { PERMISSION_MAP } from "../models/permissionPresets.js";

// Create Role Schema
export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Role name must be at least 2 characters")
      .max(50, "Role name cannot exceed 50 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
    permissions: z
      .array(
        z.string().refine(
          (perm) => PERMISSION_MAP.includes(perm),
          (perm) => ({ message: `Invalid permission: ${perm}` }),
        ),
      )
      .min(1, "At least one permission is required")
      .refine(
        (perms) => new Set(perms).size === perms.length,
        "Duplicate permissions are not allowed",
      ),
  }),
});

// Update Role Schema
export const updateRoleSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "Role name must be at least 2 characters")
        .max(50, "Role name cannot exceed 50 characters")
        .trim()
        .optional(),
      description: z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
      permissions: z
        .array(
          z.string().refine(
            (perm) => PERMISSION_MAP.includes(perm),
            (perm) => ({ message: `Invalid permission: ${perm}` }),
          ),
        )
        .min(1, "At least one permission is required")
        .refine(
          (perms) => new Set(perms).size === perms.length,
          "Duplicate permissions are not allowed",
        )
        .optional(),
      isActive: z.boolean().optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update",
    ),
});

// Assign Role to User Schema
export const assignRoleSchema = z.object({
  body: z.object({
    roleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid roleId format"),
  }),
});
