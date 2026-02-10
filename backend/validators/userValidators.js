import { z } from "zod";

export const createUserSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    userEmail: z.email("Please provide a valid email address").optional(),
    mobile: z
      .string()
      .regex(/^[1-9]\d{9}$/, "Please provide valid mobile number"),
    role: z.enum(["user", "admin", "super_admin"]),
    password: z.string().min(8).optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional(),
    userEmail: z.email().optional(),
    mobile: z
      .string()
      .regex(/^[1-9]\d{9}$/)
      .optional(),
    role: z.enum(["user", "admin", "super_admin"]).optional(),
    password: z.string().min(8).optional(),
  })
  .strict();

export const updateRoleSchema = z
  .object({
    role: z.enum(["user", "admin", "super_admin"]),
  })
  .strict();
