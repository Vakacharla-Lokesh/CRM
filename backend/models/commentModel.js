import { Schema, model } from "mongoose";

const commentsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "commentId" },
    leadId: { type: Schema.Types.ObjectId, required: true, rel: "Leads" },
    commentTitle: { type: String, required: true },
    commentDesc: { type: String },
  },
  { timestamps: true },
);

export default model("Comments", commentsSchema);
