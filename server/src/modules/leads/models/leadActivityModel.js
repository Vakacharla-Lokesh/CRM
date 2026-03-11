import { Schema, model } from "mongoose";

// MongoDB collection schema
const leadActivitySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "activityId", auto: true },
    leadId: { type: Schema.Types.ObjectId, required: true, ref: "Leads" },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenants" },
    type: { type: String, required: true },
    description: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true },
);

// Indexes
leadActivitySchema.index({ leadId: 1, createdAt: -1 });
leadActivitySchema.index({ tenantId: 1 });

export default model("LeadActivities", leadActivitySchema);
