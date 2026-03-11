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
      required: true,
    },
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: "Pipelines",
      default: null,
    },
    rfm: {
      rScore: { type: Number, min: 0, max: 5, default: 0 },
      fScore: { type: Number, min: 0, max: 5, default: 0 },
      mScore: { type: Number, min: 0, max: 5, default: 0 },
      segment: {
        type: String,
        enum: [
          "Hot Deals",
          "Sleeping Giants",
          "Time Wasters",
          "Dead Wood",
          "Active Prospect",
          "Unsegmented",
        ],
        default: "Unsegmented",
      },
      lastTouchpoint: { type: Date, default: null },
      engagementCount: { type: Number, default: 0 },
      dealValue: { type: Number, default: 0 },
    },
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
leadsSchema.index({ pipelineId: 1, status: 1, createdAt: -1 });

// search index
leadsSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
});

export default model("Leads", leadsSchema);
