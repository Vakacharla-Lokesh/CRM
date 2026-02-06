import { z } from "zod";

export const createTenantSchema = z
  .object({
    tenantName: z.string().min(1),
  })
  .strict();
