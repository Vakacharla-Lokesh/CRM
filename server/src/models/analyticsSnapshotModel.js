import { Schema, model } from "mongoose";

const analyticsSnapshotSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Tenants",
    },
    scopeKey: {
      type: String,
      required: true,
    },
    periodKey: {
      type: String,
      required: true,
      default: "historical",
    },
    stats: {
      totalLeads: { type: Number, default: 0 },
      convertedLeads: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      activeCampaigns: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      totalDeals: { type: Number, default: 0 },
      openDeals: { type: Number, default: 0 },
      totalOrganizations: { type: Number, default: 0 },
    },
    changes: {
      leadsChange: { type: Number, default: 0 },
      conversionRateChange: { type: Number, default: 0 },
      revenueChange: { type: Number, default: 0 },
      campaignsChange: { type: Number, default: 0 },
    },
    period: {
      days: { type: Number, default: 30 },
      currentStart: { type: Date },
      currentEnd: { type: Date },
      previousStart: { type: Date },
      previousEnd: { type: Date },
    },
    computedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true },
);

analyticsSnapshotSchema.index(
  { tenantId: 1, scopeKey: 1, periodKey: 1 },
  { unique: true },
);

analyticsSnapshotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("AnalyticsSnapshots", analyticsSnapshotSchema);
