import { z } from "zod";
export const registerSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    userEmail: z.string().email("Please provide a valid email address"),
    mobile: z
      .string()
      .regex(/^[1-9]\d{9}$/, "Please provide valid mobile number")
      .optional(),
    role: z.enum(["user", "admin", "super_admin"]),
    password: z.string().min(8),
    tenantId: z.string().optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    userEmail: z.string().email().optional(),
    mobile: z.string().optional(),
    password: z.string().min(1),
    tenantId: z.string().optional(),
  })
  .strict()
  .refine((data) => data.userEmail || data.mobile, {
    message: "Either email or mobile is required",
  });
