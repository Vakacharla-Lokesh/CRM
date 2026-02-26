import { Schema, model } from "mongoose";

const widgetSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["bar", "line", "pie", "area", "number", "table"],
      required: true,
    },
    entity: {
      type: String,
      enum: ["leads", "deals", "organizations"],
      required: true,
    },
    title: { type: String, required: true },
    filters: { type: Schema.Types.Mixed, default: {} },
    groupBy: { type: String, required: true },
    metric: {
      type: String,
      enum: ["count", "sum", "avg"],
      required: true,
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 4 },
      h: { type: Number, default: 3 },
    },
  },
  { timestamps: true },
);

const userAnalyticsDashboardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Users",
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenants",
      index: true,
    },
    layout: {
      type: [widgetSchema],
      default: [],
    },
  },
  { timestamps: true },
);

// Compound index for per-user, per-tenant lookup
userAnalyticsDashboardSchema.index({ userId: 1, tenantId: 1 }, { unique: true });

export default model("UserAnalyticsDashboard", userAnalyticsDashboardSchema);
