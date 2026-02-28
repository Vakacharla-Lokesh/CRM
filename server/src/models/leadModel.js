import { Schema, model } from "mongoose";

// MongoDB collection schema
const leadsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "leadId", auto: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      rel: "Organizations",
    },
    userId: { type: Schema.Types.ObjectId, required: true, rel: "Users" },
    tenantId: { type: Schema.Types.ObjectId, rel: "Tenants" },
    leadFirstName: { type: String, required: true },
    leadLastName: { type: String, default: null },
    leadEmail: {
      type: String,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email address",
      ],
    },
    leadSource: {
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
    leadScore: { type: Number, min: 0, max: 100, default: 0 },
    leadStatus: {
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
leadsSchema.index({ userId: 1, createdAt: -1 });
leadsSchema.index({ tenantId: 1 });
leadsSchema.index({ organizationId: 1 });
leadsSchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true, name: "idempotency_key_unique" },
);

// search index
leadsSchema.index({
  leadFirstName: "text",
  leadLastName: "text",
  leadEmail: "text",
});

export default model("Leads", leadsSchema);
