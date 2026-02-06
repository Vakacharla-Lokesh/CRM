import { Schema, model } from "mongoose";

const tenantSchema = new Schema(
  {
    _id: { type: Schema.Types.UUID, default: () => crypto.randomUUID() },
    tenantName: { type: String, required: true },
  },
  { timestamps: true },
);

export default model("Tenants", tenantSchema);
