import { Schema, model } from "mongoose";

// MongoDB collection schema
const callsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "callId", auto: true },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    callType: { type: String, required: true, enum: ["incoming", "outgoing"] },
    callNotes: { type: String, maxLength: 250 },
    status: {
      type: String,
      required: true,
      enum: ["completed", "missed", "no-answer", "voicemail"],
    },
    duration: { type: Number, min: 1, max: 1000 },
    // Used for offline-sync deduplication — enforced unique when present
    idempotencyKey: { type: String, default: null },
  },
  { timestamps: true },
);

// Indexes
callsSchema.index({ leadId: 1, createdAt: -1 });
callsSchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true, name: "idempotency_key_unique" },
);

export default model("Calls", callsSchema);
