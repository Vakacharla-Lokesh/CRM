import { Schema, model } from "mongoose";

// MongoDB collection schema
const attachmentsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "attachmentId", auto: true },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    fileData: { type: Buffer, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    fileType: { type: String, required: true },
  },
  { timestamps: true },
);

// Indexes
attachmentsSchema.index({ leadId: 1, createdAt: -1 });

export default model("Attachments", attachmentsSchema);
