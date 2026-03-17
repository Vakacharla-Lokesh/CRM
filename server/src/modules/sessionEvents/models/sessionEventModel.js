import mongoose, { Schema, model } from "mongoose";

const sessionEventSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "page_enter",
        "scroll_depth",
        "section_view",
        "cta_click",
        "field_focus",
        "page_exit",
      ],
    },
    data: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, required: true, default: Date.now },
    visitorName: { type: String, default: null },
    visitorEmail: { type: String, default: null },
  },
  {
    _id: true,
  },
);

const SessionEvent = model("SessionEvents", sessionEventSchema);

export default SessionEvent;
