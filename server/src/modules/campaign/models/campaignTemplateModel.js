import { Schema, model } from "mongoose";

const campaignTemplateSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenants", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, maxLength: 300, default: "" },
    category: {
      type: String,
      enum: ["Onboarding", "Announcement", "Follow-Up", "Launch", "Custom"],
      default: "Custom",
    },
    subject: { type: String, required: true, maxLength: 300 },
    body: { type: String, required: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

campaignTemplateSchema.index({ tenantId: 1, createdAt: -1 });
campaignTemplateSchema.index({ tenantId: 1, createdBy: 1 });

export default model("CampaignTemplates", campaignTemplateSchema);
