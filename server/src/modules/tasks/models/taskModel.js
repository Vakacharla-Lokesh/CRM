import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "taskId", auto: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenants" },
    title: { type: String, required: true, minLength: 1, maxLength: 200 },
    description: { type: String, maxLength: 2000 },
    status: {
      type: String,
      enum: ["todo", "in_progress", "in_review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    // Relation — only one should be set at a time
    relationType: {
      type: String,
      enum: ["lead", "deal", "organization"],
      default: null,
    },
    relationId: { type: Schema.Types.ObjectId, default: null },
    dueDate: { type: Date, default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: "Users", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  },
  { timestamps: true },
);

taskSchema.index({ tenantId: 1, status: 1 });
taskSchema.index({ tenantId: 1, assignedTo: 1 });
taskSchema.index({ relationType: 1, relationId: 1 });

export default model("Tasks", taskSchema);
