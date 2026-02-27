import { Schema, model } from "mongoose";

// MongoDB collection schema
const tenantSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "tenantId", auto: true },
    tenantName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email address",
      ],
    },
    mobile: {
      type: String,
      required: true,
      match: [/^[1-9]\d{9}$/, "Please provide valid mobile number"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// search index
tenantSchema.index({
  tenantName: "text",
  email: "text",
});

export default model("Tenants", tenantSchema);
