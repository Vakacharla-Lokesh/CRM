import { Schema, model } from "mongoose";

const callsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "callId" },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    callType: { type: String, required: true, enum: ["incoming", "outgoing"] },
    callNotes: { type: String, maxLength: 250 },
    status: {
      type: String,
      required: true,
      enum: ["completed", "missed", "no-answer", "voicemail"],
    },
    duration: { type: Number, min: 1, max: 1000 },
  },
  { timestamps: true },
);

export default model("Calls", callsSchema);
