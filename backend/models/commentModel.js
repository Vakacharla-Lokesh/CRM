import { Schema, model } from "mongoose";

const commentsSchema = new Schema(
  {
    leadId: { type: String, required: true },
    commentTitle: { type: String, required: true },
    commentDesc: { type: String },
  },
  { timestamps: true },
);

export default model("Comments", commentsSchema);
