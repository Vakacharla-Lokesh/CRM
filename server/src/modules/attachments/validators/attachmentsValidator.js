import { z } from "zod";

export const presignedUrlSchema = z
  .object({
    leadId: z.string().min(1),
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    fileSize: z.number().positive(),
  })
  .strict();

export const createAttachmentSchema = z
  .object({
    leadId: z.string().min(1),
    fileName: z.string().min(1),
    fileSize: z.number().positive().optional(),
    fileType: z.string().min(1),
    s3Key: z.string().min(1),
    s3Url: z.string().url(),
  })
  .strict();
