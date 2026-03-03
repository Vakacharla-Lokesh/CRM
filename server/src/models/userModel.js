import { Schema, model, mongoose } from "mongoose";
import bcrypt from "bcryptjs";

// MongoDB collection schema
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
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      index: true,
      validate: {
        validator: function () {
          return !!this.roleId;
        },
        message: "roleId is required for all users",
      },
      comment: "Reference to dynamic Role document (RBAC v2)",
    },
    password: { type: String, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Pre hook used for hashing pasword before saving to collection
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ tenantId: 1 });
userSchema.index({ tenantId: 1, roleId: 1 });

// search index
userSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
});

export default model("Users", userSchema);
