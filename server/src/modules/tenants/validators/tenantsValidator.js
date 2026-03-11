import { z } from "zod";

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const mobileRegex = /^[1-9]\d{9}$/;

export const createTenantSchema = z
  .object({
    name: z.string().min(1, "Tenant name is required"),
    email: z.string().regex(emailRegex, "Please provide a valid email address"),
    mobile: z.string().regex(mobileRegex, "Please provide valid mobile number"),
  })
  .strict();

export const updateTenantSchema = z
  .object({
    name: z.string().min(1, "Tenant name is required").optional(),
    email: z
      .string()
      .regex(emailRegex, "Please provide a valid email address")
      .optional(),
    mobile: z
      .string()
      .regex(mobileRegex, "Please provide valid mobile number")
      .optional(),
  })
  .strict();
