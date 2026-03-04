import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { ALL_PERMISSIONS } from "./permissionPresets.js";

const userSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "userId", auto: true },
    tenantId: { type: Schema.Types.ObjectId, required: true, rel: "Tenants" },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: {
      type: String,
      unique: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email address",
      ],
    },
    mobile: {
      type: String,
      required: false,
      match: [/^[1-9]\d{9}$/, "Please provide valid mobile number"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      required: true,
    },
    permissions: {
      type: Map,
      of: Boolean,
      default: {},
      validate: {
        validator: function (map) {
          for (const key of map.keys()) {
            if (!ALL_PERMISSIONS.includes(key)) return false;
          }
          return true;
        },
        message: "One or more permissions are invalid",
      },
    },
    password: { type: String, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getPermissionsArray = function () {
  return [...(this.permissions?.keys() ?? [])].filter(
    (k) => this.permissions.get(k) === true,
  );
};

userSchema.index({ tenantId: 1 });
userSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
});

export default model("Users", userSchema);
