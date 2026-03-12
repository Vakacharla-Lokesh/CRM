import { Schema, model } from "mongoose";

const dealsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "dealId", auto: true },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    organizationId: {
      type: Schema.Types.ObjectId,
      rel: "Organizations",
    },
    tenantId: { type: Schema.Types.ObjectId, required: true, rel: "Tenants" },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "Users" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "Users", default: null },
    name: { type: String, minLength: 1, maxLength: 100, required: true },
    value: { type: Number, min: 0, max: 10_00_000, default: 0 },
    status: {
      type: String,
      enum: [
        "Prospecting",
        "Qualification",
        "Negotiation",
        "Ready to close",
        "Won",
        "Lost",
      ],
    },
    idempotencyKey: { type: String },
  },
  { timestamps: true },
);

// Indexes
dealsSchema.index({ leadId: 1, createdAt: -1 });
dealsSchema.index({ tenantId: 1 });
dealsSchema.index({ createdBy: 1, createdAt: -1 });
dealsSchema.index({ assignedTo: 1, createdAt: -1 });
dealsSchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true, name: "idempotency_key_unique" },
);

// search index
dealsSchema.index({
  name: "text",
});

export default model("Deals", dealsSchema);
