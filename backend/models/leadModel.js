import { Schema, model } from "mongoose";

const leadsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "leadId" },
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
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
