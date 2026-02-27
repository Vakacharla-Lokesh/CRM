import { Schema, model } from "mongoose";

// MongoDB collection schema
const commentsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "commentId", auto: true },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    commentTitle: { type: String, required: true },
    commentDesc: { type: String },
  },
  { timestamps: true },
);

// Indexes
commentsSchema.index({ leadId: 1, createdAt: -1 });

export default model("Comments", commentsSchema);
