import { Schema, model } from "mongoose";

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

export default model("Attachments", attachmentsSchema);
