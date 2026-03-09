import { Schema, model } from "mongoose";

const campaignSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenants", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "queued", "sending", "completed", "failed"],
      default: "draft",
    },
    totalRecipients: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    openCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

campaignSchema.index({ tenantId: 1, createdAt: -1 });

const campaignEmailSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaigns",
      required: true,
    },
    leadId: { type: Schema.Types.ObjectId, ref: "Leads", required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenants", required: true },
    toEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "opened"],
      default: "pending",
    },
    sentAt: { type: Date, default: null },
    openedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

campaignEmailSchema.index({ campaignId: 1 });
campaignEmailSchema.index({ leadId: 1 });
campaignEmailSchema.index({ _id: 1, tenantId: 1 });

export const Campaign = model("Campaigns", campaignSchema);
export const CampaignEmail = model("CampaignEmails", campaignEmailSchema);
