import { Schema, model } from "mongoose";

const dealsSchema = new Schema(
  {
    _id: { type: Schema.Types.UUID, default: () => crypto.randomUUID() },
    leadId: { type: String, required: true },
    organizationId: { type: String, required: true },
    tenantId: { type: String, required: true },
    userId: { type: String, required: true },
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
