import { Schema, model } from "mongoose";

const statusStageSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    color: { type: String, default: "#6366f1" },
    order: { type: Number, required: true },
  },
  { _id: false },
);

const pipelineSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "pipelineId", auto: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "Users" },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenants" },
    name: { type: String, required: true, trim: true, maxLength: 100 },
    isDefault: { type: Boolean, default: false },
    statuses: { type: [statusStageSchema], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true },
);

pipelineSchema.index(
  { userId: 1, isDefault: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { isDefault: true },
    name: "one_default_per_user",
  },
);

pipelineSchema.index({ userId: 1, createdAt: -1 });
pipelineSchema.index({ tenantId: 1 });

export default model("Pipelines", pipelineSchema);
