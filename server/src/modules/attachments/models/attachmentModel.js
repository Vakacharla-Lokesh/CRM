import { Schema, model } from "mongoose";

const attachmentsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "attachmentId", auto: true },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    s3Key: { type: String, required: true },
    s3Url: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    fileType: { type: String, required: true },
  },
  { timestamps: true },
);

attachmentsSchema.index({ leadId: 1, createdAt: -1 });

export default model("Attachments", attachmentsSchema);
