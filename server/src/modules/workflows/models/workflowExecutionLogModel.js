import { Schema, model } from "mongoose";

const workflowExecutionLogSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    workflowId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Workflows",
      index: true,
    },
    entityType: {
      type: String,
      enum: ["lead", "deal", "organization", "call", "comment"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    triggeredAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["queued", "processing", "success", "failed", "retry"],
      default: "queued",
    },

    results: [
      {
        actionIndex: Number,
        actionType: String,
        status: String,
        message: String,
        executedAt: Date,
        error: String,
        _id: false,
      },
    ],

    sqsMessageId: String,
    sqsReceiptHandle: String,

    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true },
);

workflowExecutionLogSchema.index({ tenantId: 1, workflowId: 1 });
workflowExecutionLogSchema.index({ entityType: 1, entityId: 1 });
workflowExecutionLogSchema.index({ status: 1 });

export default model("WorkflowExecutionLogs", workflowExecutionLogSchema);
