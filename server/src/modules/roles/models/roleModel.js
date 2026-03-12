import { Schema, model } from "mongoose";
import { ALL_PERMISSIONS } from "../../../utils/permissionPresets.js";

const roleSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, ref: "Tenants" },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every((p) => ALL_PERMISSIONS.includes(p));
        },
        message: "One or more permissions are invalid",
      },
    },
  },
  { timestamps: true },
);

// Indexes
roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default model("Roles", roleSchema);
