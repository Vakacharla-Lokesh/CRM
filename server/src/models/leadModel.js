import { Schema, model } from "mongoose";

// MongoDB collection schema
const leadsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "leadId", auto: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      rel: "Organizations",
    },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "Users" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "Users", default: null },
    tenantId: { type: Schema.Types.ObjectId, rel: "Tenants" },
    firstName: { type: String, required: true },
    lastName: { type: String, default: null },
    email: {
      type: String,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email address",
      ],
    },
    source: {
      type: String,
      enum: [
        "API",
        "Outsource",
        "Phone",
        "Website",
        "Facebook Ads",
        "Google Ads",
        "Instagram",
        "LinkedIn",
        "Email Marketing",
        "Referral",
        "Cold Call",
        "WhatsApp",
        "Other",
      ],
      default: "API",
    },
    score: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ["New", "Converted", "Dead", "Follow-Up"],
      required: true,
    },
    // Used for offline-sync deduplication — enforced unique when present
    idempotencyKey: { type: String, default: null },
  },
  { timestamps: true },
);

// Indexes
leadsSchema.index({ createdBy: 1, createdAt: -1 });
leadsSchema.index({ assignedTo: 1, createdAt: -1 });
leadsSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
leadsSchema.index({ organizationId: 1 });
leadsSchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true, name: "idempotency_key_unique" },
);

// search index
leadsSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
});

export default model("Leads", leadsSchema);
