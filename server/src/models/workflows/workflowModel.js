import { Schema, model } from "mongoose";

const workflowSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Tenants",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    description: {
      type: String,
      maxLength: 500,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Trigger configuration
    trigger: {
      entity: {
        type: String,
        enum: ["lead", "deal", "organization", "call", "comment"],
        required: true,
      },
      action: {
        type: String,
        enum: ["create", "update", "delete"],
        required: true,
      },
      conditions: [
        {
          field: String,
          operator: {
            type: String,
            enum: [
              "equals",
              "gte",
              "lte",
              "contains",
              "startsWith",
              "isEmpty",
              "isNotEmpty",
            ],
          },
          value: Schema.Types.Mixed,
          _id: false,
        },
      ],
    },

    // Actions to execute
    actions: [
      {
        type: {
          type: String,
          enum: [
            "send_email",
            "update_field",
            "create_task",
            "webhook",
            "export_s3",
          ],
          required: true,
        },
        // send_email
        emailTemplate: String,
        recipient: String,
        subject: String,
        body: String,
        _id: false,
      },
    ],

    // Execution tracking
    totalExecutions: {
      type: Number,
      default: 0,
    },
    lastExecuted: Date,
    lastStatus: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },

    // Scheduling (optional)
    schedule: {
      enabled: Boolean,
      cronExpression: String,
    },
  },
  { timestamps: true },
);
workflowSchema.index({ tenantId: 1, isActive: 1 });
workflowSchema.index({ createdBy: 1 });
export default model("Workflows", workflowSchema);
