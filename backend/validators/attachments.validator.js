import { z } from "zod";

const base64Regex =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const createAttachmentSchema = z
  .object({
    leadId: z.string().min(1),

    fileData: z
      .string()
      .regex(base64Regex, "fileData must be a valid base64 string"),

    fileName: z.string().min(1),

    fileSize: z.number().positive().optional(),

    fileType: z.string().min(1),
  })
  .strict();
