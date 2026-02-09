import { Schema, model } from "mongoose";

const tenantSchema = new Schema(
  {
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
  },
  { timestamps: true },
);

export default model("Tenants", tenantSchema);
