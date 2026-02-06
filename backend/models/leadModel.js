import { Schema, model } from "mongoose";

const leadsSchema = new Schema(
  {
    _id: { type: Schema.Types.UUID, default: () => crypto.randomUUID() },
    organizationId: { type: String, required: true },
    userId: { type: String, required: true },
    tenantId: { type: String },
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
      enum: ["API", "Outsource"],
      default: "API",
    },
    leadScore: { type: Number, min: 0, max: 100, default: 0 },
    leadStatus: {
      type: String,
      enum: ["New", "Converted", "Dead", "Follow-Up"],
      required: true,
    },
  },
  { timestamps: true },
);

export default model("Leads", leadsSchema);
