import { Schema, model } from "mongoose";

const dealsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "dealId" },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      rel: "Organizations",
    },
    tenantId: { type: Schema.Types.ObjectId, required: true, rel: "Tenants" },
    userId: { type: Schema.Types.ObjectId, required: true, rel: "Users" },
    dealName: { type: String, minLength: 1, maxLength: 100, required: true },
    dealValue: { type: Number, min: 0, max: 1000000, default: 0 },
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

export default model("Deals", dealsSchema);
