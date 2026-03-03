import { z } from "zod";

export const createUserSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    email: z.email("Please provide a valid email address").optional(),
    mobile: z
      .string()
      .regex(/^[1-9]\d{9}$/, "Please provide valid mobile number"),
    role: z.string().min(1).max(50),
    roleId: z.string().optional(),
    password: z.string().min(8).optional(),
    tenantId: z.string().min(1).optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional(),
    email: z.email().optional(),
    mobile: z
      .string()
      .regex(/^[1-9]\d{9}$/)
      .optional(),
    role: z.string().min(1).max(50).optional(),
    roleId: z.string().optional(),
    password: z.string().min(8).optional(),
  })
  .strict();

export const updateRoleSchema = z
  .object({
    role: z.string().min(1).max(50),
  })
  .strict();

export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .strict();

export const passwordResetSchema = z
  .object({
    email: z.string().email("Please provide a valid email address"),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    name: z.string().min(1).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
  })
  .strict();
