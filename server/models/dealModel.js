import { Schema, model } from "mongoose";

// MongoDB collection schema
const dealsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "dealId", auto: true },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      rel: "Organizations",
    },
    tenantId: { type: Schema.Types.ObjectId, required: true, rel: "Tenants" },
    userId: { type: Schema.Types.ObjectId, required: true, rel: "Users" },
    dealName: { type: String, minLength: 1, maxLength: 100, required: true },
    dealValue: { type: Number, min: 0, max: 10_00_000, default: 0 },
    dealStatus: {
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
  },
  { timestamps: true },
);

// Indexes
dealsSchema.index({ leadId: 1, createdAt: -1 });
dealsSchema.index({ tenantId: 1 });

// search index
dealsSchema.index({
  dealName: "text",
});

export default model("Deals", dealsSchema);
