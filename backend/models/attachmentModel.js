import { Schema, model } from "mongoose";

const attachmentsSchema = new Schema(
  {
    leadId: { type: String, required: true },
    fileData: { type: Buffer, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    fileType: { type: String, required: true },
  },
  { timestamps: true },
);

export default model("Attachments", attachmentsSchema);