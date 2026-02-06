import { z } from "zod";

export const createUserSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    userEmail: z
      .string()
      .email("Please provide a valid email address")
      .optional(),
    mobile: z
      .string()
      .regex(/^[1-9]\d{9}$/, "Please provide valid mobile number"),
    role: z.enum(["user", "admin", "super_admin"]),
    password: z.string().min(8).optional(),
  })
  .strict();
