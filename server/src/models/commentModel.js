import { Schema, model } from "mongoose";

// MongoDB collection schema
const commentsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "commentId", auto: true },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    commentTitle: { type: String, required: true },
    commentDesc: { type: String },
    // Used for offline-sync deduplication — enforced unique when present
    idempotencyKey: { type: String, default: null },
  },
  { timestamps: true },
);

// Indexes
commentsSchema.index({ leadId: 1, createdAt: -1 });
commentsSchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true, name: "idempotency_key_unique" },
);

export default model("Comments", commentsSchema);
