import { Schema, model } from "mongoose";

const roundRobinPointerSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "Tenants",
    },
    lastAssignedIndex: { type: Number, default: -1 },
  },
  { timestamps: true },
);

export default model("RoundRobinPointers", roundRobinPointerSchema);
