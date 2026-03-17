import { Schema, model } from "mongoose";

const callsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "callId", auto: true },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    type: { type: String, required: true, enum: ["incoming", "outgoing"] },
    notes: { type: String, maxLength: 250 },
    status: {
      type: String,
      required: true,
      enum: ["completed", "missed", "no-answer", "voicemail"],
    },
    duration: { type: Number, min: 1, max: 1000 },
    idempotencyKey: { type: String },
  },
  { timestamps: true },
);

callsSchema.index({ leadId: 1, createdAt: -1 });
callsSchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true, name: "idempotency_key_unique" },
);

export default model("Calls", callsSchema);
