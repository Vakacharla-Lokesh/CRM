import { Schema, model } from "mongoose";

const attachmentsSchema = new Schema(
  {
    _id: { type: Schema.Types.UUID, default: () => crypto.randomUUID() },
    leadId: { type: String, required: true },
    fileData: { binData: Buffer, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    fileType: { type: String, required: true },
  },
  { timestamps: true },
);

export default model("Attachments", attachmentsSchema);
