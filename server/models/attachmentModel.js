import { Schema, model } from "mongoose";

// MongoDB collection schema
const attachmentsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "attachmentId", auto: true },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    s3Key: { type: String, required: true },   // S3 object key e.g. attachments/{leadId}/{uuid}-filename
    s3Url: { type: String, required: true },   // Base S3 URL (not presigned, for reference)
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    fileType: { type: String, required: true },
  },
  { timestamps: true },
);

// Indexes
attachmentsSchema.index({ leadId: 1, createdAt: -1 });

export default model("Attachments", attachmentsSchema);
